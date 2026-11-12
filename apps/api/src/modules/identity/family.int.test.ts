import { randomUUID } from 'node:crypto';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { familyResponseSchema, meResponseSchema, type MeResponse } from '@kids-chores/contracts';
import { APP_CONFIG, type AppConfig } from '../../platform/config';
import { PrismaService } from '../../platform/database';
import { cookieHeader, createTestApp } from '../../testing';

describe('family members over HTTP', () => {
  let app: NestFastifyApplication;
  let origin: string;

  beforeAll(async () => {
    app = await createTestApp();
    origin = new URL(app.get<AppConfig>(APP_CONFIG).PUBLIC_ORIGIN).origin;
  });

  afterAll(async () => {
    await app.close();
  });

  const unique = (): string => randomUUID().slice(0, 8);

  const devLogin = async (name: string, contact: { email?: string; phone?: string } = {}): Promise<string> => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/dev/login',
      headers: { origin },
      payload: { name, ...contact },
    });
    expect(response.statusCode).toBe(204);
    return cookieHeader(response);
  };

  const me = async (cookie: string): Promise<MeResponse | null> => {
    const response = await app.inject({ method: 'GET', url: '/v1/me', headers: { cookie } });
    return response.statusCode === 200 ? meResponseSchema.parse(response.json()) : null;
  };

  const family = async (cookie: string) => {
    const response = await app.inject({ method: 'GET', url: '/v1/family', headers: { cookie } });
    expect(response.statusCode).toBe(200);
    return familyResponseSchema.parse(response.json());
  };

  const send = (cookie: string, method: 'POST' | 'DELETE', url: string, payload?: object) =>
    app.inject({ method, url, headers: { origin, cookie }, payload });

  it('lets the owner invite by email and moves the invited parent with every device', async () => {
    const tag = unique();
    const mom = await devLogin(`mom-${tag}`);
    const email = `Dad.${tag}@Example.com`;
    const invite = await send(mom, 'POST', '/v1/family/invites', { contact: { kind: 'email', value: email } });
    expect(invite.statusCode).toBe(201);
    expect(invite.json()).toMatchObject({ kind: 'email', hint: 'd•••@example.com' });
    const momMe = await me(mom);
    expect(momMe?.role).toBe('owner');

    const dad = await devLogin(`dad-${tag}`, { email: `dad.${tag}@example.com` });
    const dadTablet = await devLogin(`dad-${tag}`);
    const before = await me(dad);
    expect(before?.invites).toEqual([expect.objectContaining({ inviterName: `mom-${tag}` })]);
    const inviteId = before?.invites[0]?.id ?? '';

    const stale = await send(dad, 'POST', '/v1/sync/push', {
      mutations: [
        { mutationId: randomUUID(), schemaVersion: 1, kind: 'children', id: 'old', op: 'put', fields: { name: 'Old' }, changedAt: 1 },
      ],
    });
    expect(stale.statusCode).toBe(200);

    expect((await send(dad, 'POST', `/v1/family/invites/${inviteId}/accept`)).statusCode).toBe(204);
    const after = await me(dad);
    expect(after?.familyId).toBe(momMe?.familyId);
    expect(after?.role).toBe('parent');
    expect(after?.members).toBe(2);
    expect(after?.invites).toEqual([]);
    expect((await me(dadTablet))?.familyId).toBe(momMe?.familyId);

    const prisma = app.get(PrismaService);
    const oldFamily = before?.familyId ?? '';
    expect(await prisma.inFamily(oldFamily, (tx) => tx.family.count({ where: { id: oldFamily } }))).toBe(0);
    const devices = await prisma.inFamily(momMe?.familyId ?? '', (tx) =>
      tx.device.count({ where: { familyId: momMe?.familyId ?? '' } })
    );
    expect(devices).toBe(3);

    const wrongFamily = await app.inject({
      method: 'GET',
      url: '/v1/sync/pull?since=0',
      headers: { cookie: dad, 'x-family-id': oldFamily },
    });
    expect(wrongFamily.statusCode).toBe(409);
    const rightFamily = await app.inject({
      method: 'GET',
      url: '/v1/sync/pull?since=0',
      headers: { cookie: dad, 'x-family-id': momMe?.familyId ?? '' },
    });
    expect(rightFamily.statusCode).toBe(200);

    const members = await family(mom);
    expect(members.members.map((member) => [member.name, member.role, member.you])).toEqual([
      [`mom-${tag}`, 'owner', true],
      [`dad-${tag}`, 'parent', false],
    ]);
    expect(members.invites).toEqual([]);
  });

  it('keeps inviting and answering requests to the owner', async () => {
    const tag = unique();
    const mom = await devLogin(`mom-${tag}`, { email: `mom-${tag}@example.com` });
    const dad = await devLogin(`dad-${tag}`, { email: `dad-${tag}@example.com` });
    const inviteId = (await me(dad))?.invites.length;
    expect(inviteId).toBe(0);
    const invited = await send(mom, 'POST', '/v1/family/invites', { contact: { kind: 'email', value: `dad-${tag}@example.com` } });
    const accepted = await send(dad, 'POST', `/v1/family/invites/${invited.json<{ id: string }>().id}/accept`);
    expect(accepted.statusCode).toBe(204);

    const forbidden = await send(dad, 'POST', '/v1/family/invites', { contact: { kind: 'email', value: 'x@example.com' } });
    expect(forbidden.statusCode).toBe(403);
    const member = await send(mom, 'POST', '/v1/family/invites', { contact: { kind: 'email', value: `dad-${tag}@example.com` } });
    expect(member.statusCode).toBe(409);
    expect((await family(dad)).invites).toEqual([]);
    const invalid = await send(mom, 'POST', '/v1/family/invites', { contact: { kind: 'phone', value: '12345' } });
    expect(invalid.statusCode).toBe(400);
  });

  it('turns a request by phone into a member once the owner approves', async () => {
    const tag = unique();
    const phone = `+3460${Math.floor(1_000_000 + Math.random() * 8_999_999)}`;
    const mom = await devLogin(`mom-${tag}`, { phone });
    const grandma = await devLogin(`grandma-${tag}`);

    const unknown = await send(grandma, 'POST', '/v1/family/requests', { contact: { kind: 'phone', value: '+34 600 000 000' } });
    expect(unknown.statusCode).toBe(202);
    const spaced = `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
    const asked = await send(grandma, 'POST', '/v1/family/requests', { contact: { kind: 'phone', value: spaced } });
    expect(asked.statusCode).toBe(202);

    expect((await me(mom))?.joinRequests).toBe(1);
    const { requests } = await family(mom);
    expect(requests).toEqual([expect.objectContaining({ name: `grandma-${tag}` })]);
    const requestId = requests[0]?.id ?? '';
    expect((await send(grandma, 'POST', `/v1/family/requests/${requestId}/approve`)).statusCode).toBe(404);
    expect((await send(mom, 'POST', `/v1/family/requests/${requestId}/approve`)).statusCode).toBe(204);
    expect((await me(grandma))?.familyId).toBe((await me(mom))?.familyId);
    expect((await me(mom))?.joinRequests).toBe(0);

    const statuses: number[] = [];
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const response = await send(mom, 'POST', '/v1/family/requests', { contact: { kind: 'email', value: 'nobody@example.com' } });
      statuses.push(response.statusCode);
    }
    expect(statuses).toEqual([202, 202, 202, 202, 202, 429]);
  });

  it('lets the owner decline a request and the invited parent decline an invite', async () => {
    const tag = unique();
    const mom = await devLogin(`mom-${tag}`, { email: `mom-${tag}@example.com` });
    const stranger = await devLogin(`stranger-${tag}`, { email: `stranger-${tag}@example.com` });
    await send(stranger, 'POST', '/v1/family/requests', { contact: { kind: 'email', value: `mom-${tag}@example.com` } });
    const requestId = (await family(mom)).requests[0]?.id ?? '';
    expect((await send(mom, 'DELETE', `/v1/family/requests/${requestId}`)).statusCode).toBe(204);
    expect((await family(mom)).requests).toEqual([]);

    await send(mom, 'POST', '/v1/family/invites', { contact: { kind: 'email', value: `stranger-${tag}@example.com` } });
    const inviteId = (await me(stranger))?.invites[0]?.id ?? '';
    const outsider = await devLogin(`outsider-${tag}`);
    expect((await send(outsider, 'POST', `/v1/family/invites/${inviteId}/accept`)).statusCode).toBe(404);
    expect((await send(outsider, 'DELETE', `/v1/family/invites/${inviteId}`)).statusCode).toBe(404);
    expect((await send(stranger, 'DELETE', `/v1/family/invites/${inviteId}`)).statusCode).toBe(204);
    expect((await me(stranger))?.invites).toEqual([]);
    expect((await family(mom)).invites).toEqual([]);
  });

  it('signs a removed or leaving parent out and gives them a new family on the next sign-in', async () => {
    const tag = unique();
    const mom = await devLogin(`mom-${tag}`);
    const dad = await devLogin(`dad-${tag}`, { email: `dad-${tag}@example.com` });
    const aunt = await devLogin(`aunt-${tag}`, { email: `aunt-${tag}@example.com` });
    for (const [cookie, email] of [
      [dad, `dad-${tag}@example.com`],
      [aunt, `aunt-${tag}@example.com`],
    ] as const) {
      const invite = await send(mom, 'POST', '/v1/family/invites', { contact: { kind: 'email', value: email } });
      await send(cookie, 'POST', `/v1/family/invites/${invite.json<{ id: string }>().id}/accept`);
    }
    const familyId = (await me(mom))?.familyId;
    const dadId = (await me(dad))?.userId ?? '';

    expect((await send(dad, 'DELETE', `/v1/family/members/${(await me(aunt))?.userId}`)).statusCode).toBe(403);
    expect((await send(mom, 'DELETE', `/v1/family/members/${dadId}`)).statusCode).toBe(204);
    expect(await me(dad)).toBeNull();
    const dadAgain = await me(await devLogin(`dad-${tag}`));
    expect(dadAgain?.familyId).not.toBe(familyId);
    expect(dadAgain?.role).toBe('owner');

    const left = await send(aunt, 'POST', '/v1/family/leave');
    expect(left.statusCode).toBe(204);
    expect(left.cookies).toEqual([expect.objectContaining({ name: 'lbd_session', value: '' })]);
    expect(await me(aunt)).toBeNull();
    expect((await send(mom, 'POST', '/v1/family/leave')).statusCode).toBe(409);
    expect((await family(mom)).members).toHaveLength(1);
  });

  it('keeps the family when a parent deletes their account and hands it over when the owner does', async () => {
    const tag = unique();
    const mom = await devLogin(`mom-${tag}`);
    const momTablet = await devLogin(`mom-${tag}`);
    const dad = await devLogin(`dad-${tag}`, { email: `dad-${tag}@example.com` });
    const invite = await send(mom, 'POST', '/v1/family/invites', { contact: { kind: 'email', value: `dad-${tag}@example.com` } });
    await send(dad, 'POST', `/v1/family/invites/${invite.json<{ id: string }>().id}/accept`);
    const familyId = (await me(mom))?.familyId ?? '';

    const removed = await send(mom, 'DELETE', '/v1/me');
    expect(removed.statusCode).toBe(204);
    expect(await me(mom)).toBeNull();
    expect(await me(momTablet)).toBeNull();
    const dadNow = await me(dad);
    expect(dadNow?.familyId).toBe(familyId);
    expect(dadNow?.role).toBe('owner');
    const prisma = app.get(PrismaService);
    expect(await prisma.inFamily(familyId, (tx) => tx.family.count({ where: { id: familyId } }))).toBe(1);
  });
});
