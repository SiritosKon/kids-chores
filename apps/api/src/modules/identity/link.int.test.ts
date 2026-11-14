import { randomUUID } from 'node:crypto';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { Redis } from 'ioredis';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { meResponseSchema } from '@kids-chores/contracts';
import { APP_CONFIG, type AppConfig } from '../../platform/config';
import { VALKEY } from '../../platform/valkey';
import { cookieHeader, createTestApp, lastMailTo } from '../../testing';
import { AccountsService } from './accounts.service';
import { AUTH_STATE_PREFIX } from './constants';
import { contactHash, emailCodeSentKey } from './lib';

describe('linking sign-in methods to one account', () => {
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

  const post = (url: string, payload: object, cookie?: string) =>
    app.inject({ method: 'POST', url, headers: cookie ? { origin, cookie } : { origin }, payload });

  const me = async (cookie: string) =>
    meResponseSchema.parse((await app.inject({ method: 'GET', url: '/v1/me', headers: { cookie } })).json());

  const devLogin = async (name: string): Promise<string> => cookieHeader(await post('/v1/dev/login', { name }));

  const codeFor = async (email: string): Promise<string> => /\b(\d{6})\b/.exec((await lastMailTo(email)).Text)?.[1] ?? '';

  const emailSignIn = async (email: string): Promise<string> => {
    const { hash } = contactHash(config.AUTH_PEPPER, { kind: 'email', value: email });
    await app.get<Redis>(VALKEY).del(emailCodeSentKey('signIn', hash));
    await post('/v1/auth/email/start', { email, locale: 'en' });
    return cookieHeader(await post('/v1/auth/email/verify', { email, code: await codeFor(email) }));
  };

  const addEmail = async (cookie: string, email: string): Promise<number> => {
    expect((await post('/v1/me/email/start', { email, locale: 'ru' }, cookie)).statusCode).toBe(204);
    expect((await lastMailTo(email)).Subject).toBe('Little Big Deals: код для подтверждения почты');
    return (await post('/v1/me/email/verify', { email, code: await codeFor(email) }, cookie)).statusCode;
  };

  it('adds a confirmed email to an account that had none, so the email opens it next time', async () => {
    const tag = randomUUID().slice(0, 8);
    const cookie = await devLogin(`telegram-${tag}`);
    const before = await me(cookie);
    expect(before.hasEmail).toBe(false);

    const email = `added-${tag}@example.com`;
    expect((await post('/v1/me/email/verify', { email, code: '123456' }, cookie)).statusCode).toBe(410);
    expect(await addEmail(cookie, email)).toBe(204);
    expect((await me(cookie)).hasEmail).toBe(true);
    expect((await me(await emailSignIn(email))).userId).toBe(before.userId);
  });

  it('refuses an email that already opens another account', async () => {
    const tag = randomUUID().slice(0, 8);
    const email = `owner-${tag}@example.com`;
    const owner = await me(await emailSignIn(email));
    const other = await devLogin(`other-${tag}`);
    expect(await addEmail(other, email)).toBe(409);
    expect((await me(other)).hasEmail).toBe(false);
    expect((await me(await emailSignIn(email))).userId).toBe(owner.userId);
  });

  it('links a provider account once and never moves it to someone else', async () => {
    const accounts = app.get(AccountsService);
    const subject = randomUUID();
    const first = await accounts.signIn('dev', randomUUID(), { contacts: [] });
    const second = await accounts.signIn('dev', randomUUID(), { contacts: [] });
    expect(await accounts.link('telegram', subject, first.userId, { name: 'Аня', contacts: [] })).toBe('linked');
    expect(await accounts.link('telegram', subject, first.userId, { contacts: [] })).toBe('linked');
    expect(await accounts.link('telegram', subject, second.userId, { contacts: [] })).toBe('taken');
    expect((await accounts.signIn('telegram', subject, { contacts: [] })).userId).toBe(first.userId);
    expect((await accounts.me({ ...first, createdAt: new Date().toISOString() })).providers).toEqual(['telegram']);
  });

  it('starts linking a provider only for a signed-in adult', async () => {
    const tag = randomUUID().slice(0, 8);
    const anonymous = await app.inject({ method: 'GET', url: '/v1/auth/telegram/start?intent=link' });
    expect(anonymous.headers.location).toMatch(/#\/\?linked=failed$/);

    const cookie = await devLogin(`link-${tag}`);
    const started = await app.inject({ method: 'GET', url: '/v1/auth/telegram/start?intent=link', headers: { cookie } });
    const state = new URL(String(started.headers.location)).searchParams.get('state');
    const stored: unknown = JSON.parse((await app.get<Redis>(VALKEY).get(`${AUTH_STATE_PREFIX}${state}`)) ?? 'null');
    expect(stored).toMatchObject({ intent: 'link', userId: (await me(cookie)).userId });
  });
});
