import { pbkdf2Sync, randomUUID } from 'node:crypto';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { Redis } from 'ioredis';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { meResponseSchema } from '@kids-chores/contracts';
import { APP_CONFIG, type AppConfig } from '../../platform/config';
import { VALKEY } from '../../platform/valkey';
import { cookieHeader, createTestApp, lastMailTo } from '../../testing';
import { contactHash, emailCodeSentKey, passwordGrantKey } from './lib';

describe('sign-in with an email and a password', () => {
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

  const request = (method: 'POST' | 'PUT', url: string, payload: object, cookie?: string) =>
    app.inject({ method, url, headers: cookie ? { origin, cookie } : { origin }, payload });

  const me = async (cookie: string) =>
    meResponseSchema.parse((await app.inject({ method: 'GET', url: '/v1/me', headers: { cookie } })).json());

  const status = async (cookie: string): Promise<number> =>
    (await app.inject({ method: 'GET', url: '/v1/me', headers: { cookie } })).statusCode;

  const emailSignIn = async (email: string): Promise<string> => {
    const { hash } = contactHash(config.AUTH_PEPPER, { kind: 'email', value: email });
    await app.get<Redis>(VALKEY).del(emailCodeSentKey('signIn', hash));
    await request('POST', '/v1/auth/email/start', { email, locale: 'en' });
    const code = /\b(\d{6})\b/.exec((await lastMailTo(email)).Text)?.[1] ?? '';
    return cookieHeader(await request('POST', '/v1/auth/email/verify', { email, code }));
  };

  const passwordSignIn = (email: string, password: string) => request('POST', '/v1/auth/password', { email, password });

  const setPassword = (cookie: string, payload: object) => request('PUT', '/v1/me/password', payload, cookie);

  it('sets a password right after a code sign-in and then opens the same account with it', async () => {
    const email = `pass-${randomUUID().slice(0, 8)}@example.com`;
    const cookie = await emailSignIn(email);
    const { userId } = await me(cookie);
    expect((await me(cookie)).hasPassword).toBe(false);
    expect((await setPassword(cookie, { password: 'short' })).statusCode).toBe(400);
    expect((await setPassword(cookie, { password: 'correct horse 1' })).statusCode).toBe(204);
    expect((await me(cookie)).hasPassword).toBe(true);

    const signedIn = await passwordSignIn(` ${email.toUpperCase()}`, 'correct horse 1');
    expect(signedIn.statusCode).toBe(204);
    expect((await me(cookieHeader(signedIn))).userId).toBe(userId);
    expect((await passwordSignIn(email, 'correct horse 2')).statusCode).toBe(401);
    expect((await passwordSignIn(`nobody-${randomUUID().slice(0, 8)}@example.com`, 'correct horse 1')).statusCode).toBe(401);
  });

  it('changes a password with the current one and signs out the other sessions', async () => {
    const email = `change-${randomUUID().slice(0, 8)}@example.com`;
    const first = await emailSignIn(email);
    await setPassword(first, { password: 'first password' });
    const other = cookieHeader(await passwordSignIn(email, 'first password'));

    expect((await setPassword(first, { password: 'second password' })).statusCode).toBe(403);
    expect((await setPassword(first, { password: 'second password', current: 'wrong password' })).statusCode).toBe(403);
    expect((await setPassword(first, { password: 'second password', current: 'first password' })).statusCode).toBe(204);
    expect(await status(first)).toBe(200);
    expect(await status(other)).toBe(401);
    expect((await passwordSignIn(email, 'first password')).statusCode).toBe(401);
    expect((await passwordSignIn(email, 'second password')).statusCode).toBe(204);
  });

  it('needs a confirmed email and the PIN before the first password', async () => {
    const tag = randomUUID().slice(0, 8);
    const noEmail = cookieHeader(await request('POST', '/v1/dev/login', { name: `nomail-${tag}` }));
    expect((await setPassword(noEmail, { password: 'some password' })).statusCode).toBe(409);

    const email = `pinned-${tag}@example.com`;
    const cookie = await emailSignIn(email);
    await app.get<Redis>(VALKEY).del(passwordGrantKey((await me(cookie)).userId));
    const salt = Buffer.from(tag).toString('base64');
    const hash = pbkdf2Sync('246810', Buffer.from(salt, 'base64'), 1000, 32, 'sha256').toString('base64');
    await request('PUT', '/v1/pin', { pin: { salt, hash, iterations: 1000 } }, cookie);
    expect((await setPassword(cookie, { password: 'some password' })).statusCode).toBe(403);
    expect((await request('POST', '/v1/pin/check', { pin: '246810' }, cookie)).statusCode).toBe(204);
    expect((await setPassword(cookie, { password: 'some password' })).statusCode).toBe(204);
  });

  it('stops trying passwords for an address after ten misses', async () => {
    const email = `guess-${randomUUID().slice(0, 8)}@example.com`;
    const cookie = await emailSignIn(email);
    await setPassword(cookie, { password: 'the right one' });
    const misses = await Promise.all(Array.from({ length: 12 }, (_, index) => passwordSignIn(email, `wrong ${index}`)));
    expect(misses.filter(({ statusCode }) => statusCode === 401)).toHaveLength(10);
    expect(misses.filter(({ statusCode }) => statusCode === 429)).toHaveLength(2);
    expect((await passwordSignIn(email, 'the right one')).statusCode).toBe(429);
  });
});
