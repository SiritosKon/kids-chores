import { randomUUID } from 'node:crypto';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { Redis } from 'ioredis';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { VALKEY } from '../../platform/valkey';
import { createTestApp } from '../../testing';
import { DailyLimitsService } from './daily-limits.service';

describe('daily limits in Valkey', () => {
  let app: NestFastifyApplication;
  let limits: DailyLimitsService;
  let valkey: Redis;

  beforeAll(async () => {
    app = await createTestApp();
    limits = app.get(DailyLimitsService);
    valkey = app.get<Redis>(VALKEY);
  });

  afterAll(async () => {
    await app.close();
  });

  it('reserves all counters or none of them', async () => {
    const tag = randomUUID();
    const narrow = { name: `test:narrow:${tag}`, perDay: 1 };
    const wide = { name: `test:wide:${tag}`, perDay: 5 };
    await limits.reserve([narrow, wide]);
    await expect(limits.reserve([narrow, wide])).rejects.toThrow('Too Many Requests');
    expect(await valkey.get(`rate:${wide.name}`)).toBe('1');
    expect(await valkey.ttl(`rate:${wide.name}`)).toBeGreaterThan(0);
  });

  it('gives a reservation back without leaving counters that never expire', async () => {
    const tag = randomUUID();
    const limit = { name: `test:release:${tag}`, perDay: 2 };
    await limits.reserve([limit]);
    await limits.release([limit]);
    expect(await valkey.exists(`rate:${limit.name}`)).toBe(0);
    await limits.release([limit]);
    expect(await valkey.exists(`rate:${limit.name}`)).toBe(0);
  });
});
