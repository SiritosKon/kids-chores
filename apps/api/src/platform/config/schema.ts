import { z } from 'zod';
import { REGIONS } from '@kids-chores/contracts';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  DATABASE_URL: z.url(),
  VALKEY_URL: z.url(),
  REGION: z.enum(REGIONS),
  PUBLIC_ORIGIN: z.url(),
  MIN_CLIENT_VERSION: z.string().min(1).default('0.0.0'),
  GIT_COMMIT: z.string().min(1).default('local'),
});
