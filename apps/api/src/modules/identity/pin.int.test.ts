import { randomUUID } from 'node:crypto';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { meResponseSchema } from '@kids-chores/contracts';
import { APP_CONFIG, type AppConfig } from '../../platform/config';
import { cookieHeader, createTestApp, lastMailTo, mailCount } from '../../testing';

describe('PIN codes by email', () => {
  let app: NestFastifyApplication;
  let origin: string;

  beforeAll(async () => {
    app = await createTestApp();
    origin = new URL(app.get<AppConfig>(APP_CONFIG).PUBLIC_ORIGIN).origin;
  });

  afterAll(async () => {
    await app.close();
  });

  const devLogin = async (name: string, email?: string): Promise<string> => {
    const response = await app.inject({ method: 'POST', url: '/v1/dev/login', headers: { origin }, payload: { name, email } });
    expect(response.statusCode).toBe(204);
    return cookieHeader(response);
  };

  const send = (cookie: string, url: string, payload: object) =>
    app.inject({ method: 'POST', url, headers: { origin, cookie }, payload });

  const codeFrom = (text: string): string => /\b(\d{6})\b/.exec(text)?.[1] ?? '';

  it('sends a code only to the address the parent signs in with', async () => {
    const tag = randomUUID().slice(0, 8);
    const email = `mom-${tag}@example.com`;
    const mom = await devLogin(`mom-${tag}`, email);
    const me = meResponseSchema.parse((await app.inject({ method: 'GET', url: '/v1/me', headers: { cookie: mom } })).json());
    expect(me.hasEmail).toBe(true);

    const wrong = await send(mom, '/v1/pin/code', { email: `other-${tag}@example.com`, locale: 'ru' });
    expect(wrong.statusCode).toBe(422);
    expect(await mailCount(`other-${tag}@example.com`)).toBe(0);

    expect((await send(mom, '/v1/pin/code', { email: ` MOM-${tag}@example.com`, locale: 'es' })).statusCode).toBe(204);
    const mail = await lastMailTo(email);
    expect(mail.Subject).toBe('Little Big Deals: código para cambiar el PIN');
    expect((await send(mom, '/v1/pin/code', { email, locale: 'ru' })).statusCode).toBe(429);

    expect((await send(mom, '/v1/pin/code/check', { code: '000000' === codeFrom(mail.Text) ? '111111' : '000000' })).statusCode).toBe(422);
    expect((await send(mom, '/v1/pin/code/check', { code: codeFrom(mail.Text) })).statusCode).toBe(204);
    expect((await send(mom, '/v1/pin/code/check', { code: codeFrom(mail.Text) })).statusCode).toBe(410);
  });

  it('says there is no address for an account without one, and burns a code after five misses', async () => {
    const tag = randomUUID().slice(0, 8);
    const noEmail = await devLogin(`telegram-${tag}`);
    expect((await send(noEmail, '/v1/pin/code', { email: `x-${tag}@example.com`, locale: 'ru' })).statusCode).toBe(409);

    const email = `dad-${tag}@example.com`;
    const dad = await devLogin(`dad-${tag}`, email);
    await send(dad, '/v1/pin/code', { email, locale: 'en' });
    const code = codeFrom((await lastMailTo(email)).Text);
    const miss = code === '123456' ? '654321' : '123456';
    const statuses: number[] = [];
    for (let attempt = 0; attempt < 5; attempt += 1) {
      statuses.push((await send(dad, '/v1/pin/code/check', { code: miss })).statusCode);
    }
    expect(statuses).toEqual([422, 422, 422, 422, 410]);
    expect((await send(dad, '/v1/pin/code/check', { code })).statusCode).toBe(410);
  });

  it('counts every try before comparing, even when the tries come at once', async () => {
    const tag = randomUUID().slice(0, 8);
    const email = `racer-${tag}@example.com`;
    const racer = await devLogin(`racer-${tag}`, email);
    await send(racer, '/v1/pin/code', { email, locale: 'en' });
    const code = codeFrom((await lastMailTo(email)).Text);
    const miss = code === '123456' ? '654321' : '123456';
    const statuses = await Promise.all(
      Array.from({ length: 12 }, () => send(racer, '/v1/pin/code/check', { code: miss }).then((response) => response.statusCode))
    );
    expect(statuses.filter((status) => status === 422)).toHaveLength(4);
    expect(statuses.filter((status) => status === 410)).toHaveLength(8);
  });
});
