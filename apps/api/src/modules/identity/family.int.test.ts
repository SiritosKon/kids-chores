import { randomUUID } from 'node:crypto';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  createdInviteSchema,
  familyResponseSchema,
  invitePreviewSchema,
  meResponseSchema,
  type MeResponse,
} from '@kids-chores/contracts';
import type { Redis } from 'ioredis';
import { APP_CONFIG, type AppConfig } from '../../platform/config';
import { PrismaService } from '../../platform/database';
import { VALKEY } from '../../platform/valkey';
import { cookieHeader, createTestApp, lastMailTo } from '../../testing';

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

  const createInvite = async (cookie: string) => {
    const response = await send(cookie, 'POST', '/v1/family/invites', { locale: 'ru' });
    expect(response.statusCode).toBe(201);
    return createdInviteSchema.parse(response.json());
  };

  const join = async (owner: string, adult: string): Promise<void> => {
    const { token } = await createInvite(owner);
    expect((await send(adult, 'POST', '/v1/family/invites/accept', { token })).statusCode).toBe(204);
  };

  it('moves whoever opens the link into the family with every device, once', async () => {
    const tag = unique();
    const mom = await devLogin(`mom-${tag}`);
    const momMe = await me(mom);
    expect(momMe?.role).toBe('owner');
    const { token, id } = await createInvite(mom);
    expect((await family(mom)).invites).toEqual([expect.objectContaining({ id })]);

    const dad = await devLogin(`dad-${tag}`);
    const dadTablet = await devLogin(`dad-${tag}`);
    const before = await me(dad);
    const preview = await send(dad, 'POST', '/v1/family/invites/preview', { token });
    expect(preview.statusCode).toBe(200);
    expect(invitePreviewSchema.parse(preview.json())).toMatchObject({ inviterName: `mom-${tag}`, sameFamily: false });

    const stale = await send(dad, 'POST', '/v1/sync/push', {
      mutations: [
        { mutationId: randomUUID(), schemaVersion: 1, kind: 'children', id: 'old', op: 'put', fields: { name: 'Old' }, changedAt: 1 },
      ],
    });
    expect(stale.statusCode).toBe(200);

    expect((await send(dad, 'POST', '/v1/family/invites/accept', { token })).statusCode).toBe(204);
    const after = await me(dad);
    expect(after?.familyId).toBe(momMe?.familyId);
    expect(after?.role).toBe('parent');
    expect(after?.members).toBe(2);
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

    const stranger = await devLogin(`stranger-${tag}`);
    expect((await send(stranger, 'POST', '/v1/family/invites/preview', { token })).statusCode).toBe(404);
    expect((await send(stranger, 'POST', '/v1/family/invites/accept', { token })).statusCode).toBe(404);
  });

  it('keeps invitations to the owner and refuses links that are not ours', async () => {
    const tag = unique();
    const mom = await devLogin(`mom-${tag}`);
    const dad = await devLogin(`dad-${tag}`);
    await join(mom, dad);

    expect((await send(dad, 'POST', '/v1/family/invites', { locale: 'ru' })).statusCode).toBe(403);
    expect((await family(dad)).invites).toEqual([]);
    const { token } = await createInvite(mom);
    const own = await send(dad, 'POST', '/v1/family/invites/preview', { token });
    expect(invitePreviewSchema.parse(own.json()).sameFamily).toBe(true);

    const forged = 'A'.repeat(43);
    expect((await send(dad, 'POST', '/v1/family/invites/preview', { token: forged })).statusCode).toBe(404);
    expect((await send(dad, 'POST', '/v1/family/invites/accept', { token: 'short' })).statusCode).toBe(400);
  });

  it('mails the link when the owner gives an address, ten times a day at most', async () => {
    const tag = unique();
    const mom = await devLogin(`Мама-${tag}`);
    const email = `dad-${tag}@example.com`;
    const invited = await send(mom, 'POST', '/v1/family/invites', { email: ` Dad-${tag}@Example.com `, locale: 'en' });
    expect(invited.statusCode).toBe(201);
    const { token } = createdInviteSchema.parse(invited.json());
    const mail = await lastMailTo(email);
    expect(mail.Subject).toBe('An invitation to a family in Little Big Deals');
    expect(mail.Text).toContain(`Мама-${tag} invites you to their family`);
    expect(mail.Text).toContain(`${origin}/kids-chores/#/join/${token}`);

    const dad = await devLogin(`dad-${tag}`);
    expect((await send(dad, 'POST', '/v1/family/invites/accept', { token })).statusCode).toBe(204);

    const toAunt: number[] = [];
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const response = await send(mom, 'POST', '/v1/family/invites', { email: `aunt-${tag}@example.com`, locale: 'ru' });
      toAunt.push(response.statusCode);
    }
    expect(toAunt).toEqual([201, 201, 201, 429]);
    const toOthers: number[] = [];
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const response = await send(mom, 'POST', '/v1/family/invites', { email: `guest-${attempt}-${tag}@example.com`, locale: 'ru' });
      toOthers.push(response.statusCode);
    }
    expect(toOthers).toEqual([201, 201, 201, 201, 201, 429]);
    expect((await send(mom, 'POST', '/v1/family/invites', { locale: 'ru' })).statusCode).toBe(201);
  });

  it('lets the owner cancel a link before anyone opens it', async () => {
    const tag = unique();
    const mom = await devLogin(`mom-${tag}`);
    const dad = await devLogin(`dad-${tag}`);
    const { id, token } = await createInvite(mom);
    expect((await send(dad, 'DELETE', `/v1/family/invites/${id}`)).statusCode).toBe(404);
    expect((await send(mom, 'DELETE', `/v1/family/invites/${id}`)).statusCode).toBe(204);
    expect((await family(mom)).invites).toEqual([]);
    expect((await send(dad, 'POST', '/v1/family/invites/accept', { token })).statusCode).toBe(404);
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

  it('lets the owner decline a request', async () => {
    const tag = unique();
    const mom = await devLogin(`mom-${tag}`, { email: `mom-${tag}@example.com` });
    const stranger = await devLogin(`stranger-${tag}`);
    await send(stranger, 'POST', '/v1/family/requests', { contact: { kind: 'email', value: `Mom-${tag}@Example.com` } });
    const requestId = (await family(mom)).requests[0]?.id ?? '';
    expect((await send(mom, 'DELETE', `/v1/family/requests/${requestId}`)).statusCode).toBe(204);
    expect((await family(mom)).requests).toEqual([]);
    expect((await me(stranger))?.familyId).not.toBe((await me(mom))?.familyId);
  });

  it('signs a removed or leaving parent out and gives them a new family on the next sign-in', async () => {
    const tag = unique();
    const mom = await devLogin(`mom-${tag}`);
    const dad = await devLogin(`dad-${tag}`);
    const aunt = await devLogin(`aunt-${tag}`);
    await join(mom, dad);
    await join(mom, aunt);
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
    const dad = await devLogin(`dad-${tag}`);
    await join(mom, dad);
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

  it('trusts the membership in the database over a session that outlived it', async () => {
    const tag = unique();
    const mom = await devLogin(`mom-${tag}`);
    const dad = await devLogin(`dad-${tag}`);
    await join(mom, dad);
    const { familyId, userId } = (await me(dad)) ?? { familyId: '', userId: '' };
    const valkey = app.get<Redis>(VALKEY);
    const sessions = await valkey.smembers(`sessions:family:${familyId}`);
    const dadSessions = (await Promise.all(sessions.map(async (key) => [key, await valkey.get(key)] as const))).filter(
      ([, raw]) => raw?.includes(userId)
    );
    expect(dadSessions).toHaveLength(1);

    await app.get(PrismaService).membership.deleteMany({ where: { userId } });
    const pull = await app.inject({
      method: 'GET',
      url: '/v1/sync/pull?since=0',
      headers: { cookie: dad, 'x-family-id': familyId },
    });
    expect(pull.statusCode).toBe(401);
    expect(await valkey.exists(dadSessions[0]?.[0] ?? '')).toBe(0);
  });
});
