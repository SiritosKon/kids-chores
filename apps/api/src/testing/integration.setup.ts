import { Redis } from 'ioredis';
import { afterAll, beforeEach } from 'vitest';
import { loadConfig } from '../platform/config';
import { RATE_LIMIT_PREFIX } from '../platform/rate-limit';

const valkey = new Redis(loadConfig(process.env, __dirname).VALKEY_URL);

beforeEach(async () => {
  const keys = await valkey.keys(`${RATE_LIMIT_PREFIX}*`);
  if (keys.length > 0) {
    await valkey.del(...keys);
  }
});

afterAll(async () => {
  await valkey.quit();
});
