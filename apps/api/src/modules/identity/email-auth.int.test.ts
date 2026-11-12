import { randomUUID } from 'node:crypto';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { Redis } from 'ioredis';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { meResponseSchema, metaResponseSchema, SESSION_COOKIE } from '@kids-chores/contracts';
import { APP_CONFIG, type AppConfig } from '../../platform/config';
import { VALKEY } from '../../platform/valkey';
import { cookieHeader, createTestApp, lastMailTo } from '../../testing';
import { contactHash, emailCodeSentKey } from './lib';

describe('sign-in by an email code', () => {
  let app: NestFastifyApplication;
  let config: AppConfig;
  let origin: string;

  beforeAll(async () => {
    app = await createTestApp();
    config = app.get<AppConfig>(APP_CONFIG);
    origin = new URL(config.PUBLIC_ORIGIN).origin;
  });

  afterAll(async () => {
    await app.close();
  });

  const post = (url: string, payload: object) => app.inject({ method: 'POST', url, headers: { origin }, payload });

  const me = async (cookie: string) =>
    meResponseSchema.parse((await app.inject({ method: 'GET', url: '/v1/me', headers: { cookie } })).json());

  const codeFor = async (email: string): Promise<string> =>
    /\b(\d{6})\b/.exec((await lastMailTo(email)).Text)?.[1] ?? '';

  const allowResend = async (email: string): Promise<void> => {
    const { hash } = contactHash(config.AUTH_PEPPER, { kind: 'email', value: email });
    await app.get<Redis>(VALKEY).del(emailCodeSentKey('signIn', hash));
  };

  const signIn = async (email: string): Promise<string> => {
    await allowResend(email);
    expect((await post('/v1/auth/email/start', { email, locale: 'en' })).statusCode).toBe(204);
    const verified = await post('/v1/auth/email/verify', { email, code: await codeFor(email) });
    expect(verified.statusCode).toBe(204);
    return cookieHeader(verified);
  };

  it('tells the app that email sign-in is on', async () => {
    const meta = metaResponseSchema.parse((await app.inject({ method: 'GET', url: '/v1/meta' })).json());
    expect(meta.auth.emailSignIn).toBe(true);
    expect(meta.auth.contacts).toContain('email');
  });

  it('signs in with the code from the email and brings the same family back next time', async () => {
    const email = `parent-${randomUUID().slice(0, 8)}@example.com`;
    expect((await post('/v1/auth/email/start', { email, locale: 'ru' })).statusCode).toBe(204);
    expect((await post('/v1/auth/email/start', { email, locale: 'ru' })).statusCode).toBe(429);
    expect((await lastMailTo(email)).Subject).toBe('Little Big Deals: код для входа');
    const code = await codeFor(email);

    const wrong = await post('/v1/auth/email/verify', { email, code: code === '111111' ? '222222' : '111111' });
    expect(wrong.statusCode).toBe(422);
    expect(wrong.cookies.filter((cookie) => cookie.name === SESSION_COOKIE)).toEqual([]);
    const verified = await post('/v1/auth/email/verify', { email, code });
    expect(verified.statusCode).toBe(204);
    const first = await me(cookieHeader(verified));
    expect(first).toMatchObject({ hasEmail: true, role: 'owner' });
    expect((await post('/v1/auth/email/verify', { email, code })).statusCode).toBe(410);

    const again = await me(await signIn(email.toUpperCase()));
    expect(again.userId).toBe(first.userId);
    expect(again.familyId).toBe(first.familyId);
  });

  it('opens the account that already has this verified email', async () => {
    const tag = randomUUID().slice(0, 8);
    const email = `g.parent.${tag}@gmail.com`;
    const google = await app.inject({
      method: 'POST',
      url: '/v1/dev/login',
      headers: { origin },
      payload: { name: `google-${tag}`, email },
    });
    const viaGoogle = await me(cookieHeader(google));
    const viaCode = await me(await signIn(`gparent${tag}@gmail.com`));
    expect(viaCode.userId).toBe(viaGoogle.userId);
    expect(viaCode.familyId).toBe(viaGoogle.familyId);
  });
});
