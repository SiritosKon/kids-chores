import { randomUUID } from 'node:crypto';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  syncPullResponseSchema,
  syncPushResponseSchema,
  type SyncFields,
  type SyncMutation,
  type SyncPullResponse,
} from '@kids-chores/contracts';
import { APP_CONFIG, type AppConfig } from '../../platform/config';
import { PrismaService } from '../../platform/database';
import { cookieHeader, createTestApp } from '../../testing';

describe('sync over HTTP', () => {
  let app: NestFastifyApplication;
  let origin: string;

  beforeAll(async () => {
    app = await createTestApp();
    origin = new URL(app.get<AppConfig>(APP_CONFIG).PUBLIC_ORIGIN).origin;
  });

  afterAll(async () => {
    await app.close();
  });

  const devLogin = async (name: string): Promise<string> => {
    const response = await app.inject({ method: 'POST', url: '/v1/dev/login', headers: { origin }, payload: { name } });
    expect(response.statusCode).toBe(204);
    return cookieHeader(response);
  };

  const family = async (): Promise<[string, string]> => {
    const name = `sync-${randomUUID().slice(0, 8)}`;
    return [await devLogin(name), await devLogin(name)];
  };

  const put = (kind: SyncMutation['kind'], id: string, fields: SyncFields, changedAt: number): SyncMutation => ({
    mutationId: randomUUID(),
    schemaVersion: 1,
    kind,
    id,
    op: 'put',
    fields,
    changedAt,
  });

  const remove = (kind: SyncMutation['kind'], id: string, changedAt: number): SyncMutation => ({
    ...put(kind, id, {}, changedAt),
    op: 'delete',
  });

  const push = async (cookie: string, mutations: SyncMutation[]) => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/sync/push',
      headers: { cookie, origin },
      payload: { mutations },
    });
    expect(response.statusCode).toBe(200);
    return syncPushResponseSchema.parse(response.json());
  };

  const pull = async (cookie: string, since = 0, limit?: number): Promise<SyncPullResponse> => {
    const query = limit === undefined ? `since=${since}` : `since=${since}&limit=${limit}`;
    const response = await app.inject({ method: 'GET', url: `/v1/sync/pull?${query}`, headers: { cookie } });
    expect(response.statusCode).toBe(200);
    return syncPullResponseSchema.parse(response.json());
  };

  it('closes sync without a session', async () => {
    const pulled = await app.inject({ method: 'GET', url: '/v1/sync/pull' });
    const pushed = await app.inject({
      method: 'POST',
      url: '/v1/sync/push',
      headers: { origin },
      payload: { mutations: [put('children', 'c1', { name: 'Mia' }, 1)] },
    });
    expect(pulled.statusCode).toBe(401);
    expect(pushed.statusCode).toBe(401);
  });

  it('refuses a push from another origin', async () => {
    const [cookie] = await family();
    const response = await app.inject({
      method: 'POST',
      url: '/v1/sync/push',
      headers: { cookie, origin: 'https://evil.example' },
      payload: { mutations: [put('children', 'c1', { name: 'Mia' }, 1)] },
    });
    expect(response.statusCode).toBe(403);
  });

  it('gives another device of the family what one device pushed', async () => {
    const [tablet, phone] = await family();
    const pushed = await push(tablet, [put('children', 'c1', { name: 'Mia', order: 0 }, 100)]);
    expect(pushed).toEqual({ applied: 1, rejected: [], lastChangeNumber: 1 });
    const pulled = await pull(phone);
    expect(pulled).toEqual({
      records: [{ kind: 'children', id: 'c1', data: { name: 'Mia', order: 0 }, deleted: false, changeNumber: 1 }],
      lastChangeNumber: 1,
      more: false,
    });
    expect((await pull(phone, pulled.lastChangeNumber)).records).toEqual([]);
  });

  it('applies a mutation sent twice only once', async () => {
    const [cookie] = await family();
    const mutation = put('completions', 'c1:t1:2026-10-27', { points: 2 }, 100);
    await push(cookie, [mutation]);
    expect(await push(cookie, [mutation])).toEqual({ applied: 0, rejected: [], lastChangeNumber: 1 });
  });

  it('merges a record field by field by the time of the change', async () => {
    const [tablet, phone] = await family();
    await push(tablet, [put('tasks', 't1', { name: 'Tablet', points: 1 }, 100)]);
    await push(phone, [put('tasks', 't1', { name: 'Old phone' }, 50), put('tasks', 't1', { points: 3 }, 200)]);
    const [record] = (await pull(tablet)).records;
    expect(record?.data).toEqual({ name: 'Tablet', points: 3 });
  });

  it('tells other devices about a deletion', async () => {
    const [tablet, phone] = await family();
    const id = 'c1:t1:2026-10-27';
    await push(tablet, [put('completions', id, { points: 2 }, 100)]);
    await push(phone, [remove('completions', id, 200)]);
    expect((await pull(tablet)).records).toEqual([
      { kind: 'completions', id, data: { points: 2 }, deleted: true, changeNumber: 2 },
    ]);
  });

  it('pulls a long history in pages', async () => {
    const [cookie] = await family();
    await push(cookie, ['a', 'b', 'c'].map((id, index) => put('rewards', id, { order: index }, 100)));
    const first = await pull(cookie, 0, 2);
    expect(first.records.map((record) => record.id)).toEqual(['a', 'b']);
    expect(first.more).toBe(true);
    const rest = await pull(cookie, first.lastChangeNumber, 2);
    expect(rest.records.map((record) => record.id)).toEqual(['c']);
    expect(rest.more).toBe(false);
  });

  it('keeps families apart', async () => {
    const [first] = await family();
    const [second] = await family();
    await push(first, [put('children', 'shared-id', { name: 'First' }, 100)]);
    await push(second, [put('children', 'shared-id', { name: 'Second' }, 50)]);
    expect((await pull(first)).records.map((record) => record.data)).toEqual([{ name: 'First' }]);
    expect((await pull(second)).records.map((record) => record.data)).toEqual([{ name: 'Second' }]);
  });

  it('turns away a record that grows past the limits and keeps the rest of the push', async () => {
    const [cookie] = await family();
    const fields = (from: number): SyncFields =>
      Object.fromEntries(Array.from({ length: 30 }, (_, index) => [`f${from + index}`, index]));
    const first = put('tasks', 't1', fields(0), 100);
    const second = put('tasks', 't1', fields(30), 200);
    const huge = put('tasks', 't2', { name: 'x'.repeat(20_000) }, 100);
    const fine = put('tasks', 't3', { name: 'Fine' }, 100);
    const pushed = await push(cookie, [first, second, huge, fine]);
    expect(pushed).toEqual({ applied: 2, rejected: [second.mutationId, huge.mutationId], lastChangeNumber: 2 });
    expect((await pull(cookie)).records.map((record) => record.id)).toEqual(['t1', 't3']);
  });

  it('rejects malformed changes', async () => {
    const [cookie] = await family();
    const bad = [
      { ...put('children', 'c1', { name: 'Mia' }, 100), kind: 'photos' },
      put('children', 'c1', { $deleted: false }, 100),
      put('children', 'c1', Object.fromEntries(Array.from({ length: 41 }, (_, index) => [`f${index}`, index])), 100),
      { ...put('children', 'c1', { name: 'Mia' }, 100), mutationId: 'not-a-uuid' },
    ];
    for (const mutation of bad) {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/sync/push',
        headers: { cookie, origin },
        payload: { mutations: [mutation] },
      });
      expect(response.statusCode).toBe(400);
    }
  });
});

describe('family records in Postgres', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('hides records and processed changes of another family', async () => {
    const a = randomUUID();
    const b = randomUUID();
    for (const familyId of [a, b]) {
      await prisma.inFamily(familyId, async (tx) => {
        await tx.family.create({ data: { id: familyId } });
        await tx.familyRecord.create({
          data: { familyId, kind: 'children', id: 'c1', data: {}, fieldChangedAt: {}, changeNumber: 1n },
        });
        await tx.processedMutation.create({ data: { familyId, mutationId: randomUUID() } });
      });
    }
    const seen = await prisma.inFamily(b, async (tx) => ({
      records: await tx.familyRecord.findMany({ where: { familyId: a } }),
      mutations: await tx.processedMutation.findMany({ where: { familyId: a } }),
    }));
    expect(seen).toEqual({ records: [], mutations: [] });
    await expect(
      prisma.inFamily(b, (tx) =>
        tx.familyRecord.create({
          data: { familyId: a, kind: 'children', id: 'c2', data: {}, fieldChangedAt: {}, changeNumber: 2n },
        })
      )
    ).rejects.toThrow();
    expect(await prisma.familyRecord.findMany({ where: { familyId: { in: [a, b] } } })).toEqual([]);
  });
});
