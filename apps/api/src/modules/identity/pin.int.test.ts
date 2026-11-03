import { randomUUID } from 'node:crypto';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { meResponseSchema } from '@kids-chores/contracts';
import { APP_CONFIG, type AppConfig } from '../../platform/config';
import { PrismaService } from '../../platform/database';
import { cookieHeader, createTestApp, lastMailTo, mailCount } from '../../testing';

describe('PIN change by email', () => {
  let app: NestFastifyApplication;
  let origin: string;

  beforeAll(async () => {
    app = await createTestApp();
    origin = new URL(app.get<AppConfig>(APP_CONFIG).PUBLIC_ORIGIN).origin;
  });

  afterAll(async () => {
    await app.close();
  });

  const newAddress = (): string => `pin-${randomUUID().slice(0, 8)}@example.com`;

  const devLogin = async (email?: string): Promise<string> => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/dev/login',
      headers: { origin },
      payload: { name: `pin-${randomUUID().slice(0, 8)}`, email },
    });
    expect(response.statusCode).toBe(204);
    return cookieHeader(response);
  };

  const requestCode = async (cookie: string, email: string, locale = 'en'): Promise<number> =>
    (await app.inject({ method: 'POST', url: '/v1/pin/code', headers: { origin, cookie }, payload: { email, locale } }))
      .statusCode;

  const checkCode = async (cookie: string, code: string): Promise<number> =>
    (await app.inject({ method: 'POST', url: '/v1/pin/code/check', headers: { origin, cookie }, payload: { code } }))
      .statusCode;

  const codeIn = (text: string): string => /\b(\d{6})\b/.exec(text)?.[1] ?? '';

  const wrongCode = (code: string): string => String((Number(code) + 1) % 1_000_000).padStart(6, '0');

  it('keeps only a hash of the email', async () => {
    const email = newAddress();
    const cookie = await devLogin(email);
    const me = await app.inject({ method: 'GET', url: '/v1/me', headers: { cookie } });
    const { userId } = meResponseSchema.parse(me.json());
    const user = await app.get(PrismaService).user.findUniqueOrThrow({ where: { id: userId } });
    expect(user.emailHash).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify(user)).not.toContain(email.split('@')[0]);
  });

  it('sends a code only to the email the account signed in with', async () => {
    const email = newAddress();
    const cookie = await devLogin(email);

    const foreign = await app.inject({
      method: 'POST',
      url: '/v1/pin/code',
      headers: { cookie },
      payload: { email, locale: 'en' },
    });
    expect(foreign.statusCode).toBe(403);
    expect(await requestCode('', email)).toBe(401);
    expect(await requestCode(cookie, 'someone@example.com')).toBe(422);
    expect(await mailCount('someone@example.com')).toBe(0);

    expect(await requestCode(cookie, email.toUpperCase(), 'ru')).toBe(204);
    const mail = await lastMailTo(email);
    expect(mail.Subject).toBe('Little Big Deals: код для смены PIN');
    expect(codeIn(mail.Text)).toMatch(/^\d{6}$/);

    expect(await requestCode(cookie, email)).toBe(429);
    expect(await mailCount(email)).toBe(1);
  });

  it('takes the right code once', async () => {
    const email = newAddress();
    const cookie = await devLogin(email);
    expect(await requestCode(cookie, email)).toBe(204);
    const code = codeIn((await lastMailTo(email)).Text);

    expect(await checkCode(cookie, wrongCode(code))).toBe(422);
    expect(await checkCode(cookie, code)).toBe(204);
    expect(await checkCode(cookie, code)).toBe(410);
  });

  it('keeps the code to the account it was sent for', async () => {
    const email = newAddress();
    const owner = await devLogin(email);
    const other = await devLogin(newAddress());
    expect(await requestCode(owner, email)).toBe(204);
    const code = codeIn((await lastMailTo(email)).Text);

    expect(await checkCode(other, code)).toBe(410);
    expect(await checkCode(owner, code)).toBe(204);
  });

  it('drops the code after five wrong tries', async () => {
    const email = newAddress();
    const cookie = await devLogin(email);
    expect(await requestCode(cookie, email)).toBe(204);
    const code = codeIn((await lastMailTo(email)).Text);

    for (const _ of [1, 2, 3, 4]) {
      expect(await checkCode(cookie, wrongCode(code))).toBe(422);
    }
    expect(await checkCode(cookie, wrongCode(code))).toBe(410);
    expect(await checkCode(cookie, code)).toBe(410);
  });

  it('tells an account without an email apart from a wrong email', async () => {
    const cookie = await devLogin();
    expect(await requestCode(cookie, newAddress())).toBe(409);
  });

  it('refuses a broken request', async () => {
    const email = newAddress();
    const cookie = await devLogin(email);
    expect(await requestCode(cookie, 'not an email')).toBe(400);
    expect(await requestCode(cookie, email, 'de')).toBe(400);
    expect(await checkCode(cookie, '12345')).toBe(400);
    expect(await checkCode(cookie, 'abcdef')).toBe(400);
  });
});
