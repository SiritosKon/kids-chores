import { randomUUID } from 'node:crypto';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { Redis } from 'ioredis';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { SESSION_COOKIE } from '@kids-chores/contracts';
import { cookieHeader, createTestApp } from '../../testing';
import { APP_CONFIG, type AppConfig } from '../config';
import { VALKEY } from '../valkey';
import { RATE_LIMIT_PREFIX, RATE_LIMITS } from './constants';

describe('rate limits over HTTP', () => {
  let app: NestFastifyApplication;
  let origin: string;

  beforeAll(async () => {
    app = await createTestApp();
    origin = new URL(app.get<AppConfig>(APP_CONFIG).PUBLIC_ORIGIN).origin;
  });

  afterAll(async () => {
    await app.close();
  });

  const times = (count: number): number[] => Array.from({ length: count }, (_, index) => index);

  it('slows down sign-in from one address and leaves other addresses alone', async () => {
    const attempt = (remoteAddress: string) =>
      app.inject({ method: 'POST', url: '/v1/auth/passkey/login/options', headers: { origin }, remoteAddress });
    const allowed = await Promise.all(times(RATE_LIMITS.auth.limit).map(() => attempt('203.0.113.10')));
    expect(allowed.every((response) => response.statusCode === 201)).toBe(true);

    const blocked = await attempt('203.0.113.10');
    expect(blocked.statusCode).toBe(429);
    const retryAfter = Number(blocked.headers['retry-after']);
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(RATE_LIMITS.auth.windowSeconds);

    expect((await attempt('203.0.113.11')).statusCode).toBe(201);
  });

  it('caps the requests of one session', async () => {
    const login = async (name: string): Promise<string> => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/dev/login',
        headers: { origin },
        payload: { name },
        remoteAddress: '203.0.113.20',
      });
      expect(response.statusCode).toBe(204);
      return cookieHeader(response);
    };
    const busy = await login(`busy-${randomUUID().slice(0, 8)}`);
    const calm = await login(`calm-${randomUUID().slice(0, 8)}`);
    const read = (cookie: string, remoteAddress: string) =>
      app.inject({ method: 'GET', url: '/v1/me', headers: { cookie }, remoteAddress });

    const allowed = await Promise.all(times(RATE_LIMITS.session.limit).map(() => read(busy, '203.0.113.21')));
    expect(allowed.every((response) => response.statusCode === 200)).toBe(true);
    expect((await read(busy, '203.0.113.22')).statusCode).toBe(429);
    expect((await read(calm, '203.0.113.21')).statusCode).toBe(200);
  });

  it('counts an address before looking at its session, so made-up cookies do not get around the limit', async () => {
    const guess = () =>
      app.inject({
        method: 'GET',
        url: '/v1/me',
        headers: { cookie: `${SESSION_COOKIE}=${randomUUID()}` },
        remoteAddress: '203.0.113.30',
      });
    const refused = await Promise.all(times(RATE_LIMITS.ip.limit).map(guess));
    expect(refused.every((response) => response.statusCode === 401)).toBe(true);
    expect((await guess()).statusCode).toBe(429);
  });

  it('keeps the address out of Valkey', async () => {
    await app.inject({ method: 'GET', url: '/v1/meta', remoteAddress: '198.51.100.7' });
    const keys = await app.get<Redis>(VALKEY).keys(`${RATE_LIMIT_PREFIX}*`);
    expect(keys.length).toBeGreaterThan(0);
    expect(keys.some((key) => key.includes('198.51.100.7'))).toBe(false);
  });
});
