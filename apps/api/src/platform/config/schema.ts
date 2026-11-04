import { z } from 'zod';
import { AUTH_PROVIDERS, REGIONS } from '@kids-chores/contracts';

const optionalText = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().min(1).optional()
);

export const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    TRUST_PROXY_HOPS: z.coerce.number().int().min(0).default(0),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
    DATABASE_URL: z.url(),
    VALKEY_URL: z.url(),
    REGION: z.enum(REGIONS),
    PUBLIC_ORIGIN: z.url(),
    APP_PATH: z.string().startsWith('/').endsWith('/').default('/kids-chores/'),
    MIN_CLIENT_VERSION: z.string().min(1).default('0.0.0'),
    GIT_COMMIT: z.string().min(1).default('local'),
    AUTH_PROVIDERS: z
      .string()
      .default('')
      .transform((value) =>
        value
          .split(',')
          .map((item) => item.trim())
          .filter((item) => item.length > 0)
      )
      .pipe(z.array(z.enum(AUTH_PROVIDERS))),
    AUTH_PEPPER: z.string().min(32),
    GOOGLE_CLIENT_ID: optionalText,
    GOOGLE_CLIENT_SECRET: optionalText,
    WEBAUTHN_RP_ID: optionalText,
    DEV_LOGIN: z.stringbool().default(false),
  })
  .superRefine((env, ctx) => {
    if (env.DEV_LOGIN && env.NODE_ENV === 'production') {
      ctx.addIssue({ code: 'custom', path: ['DEV_LOGIN'], message: 'dev login is not allowed in production' });
    }
    if (env.AUTH_PROVIDERS.includes('google') && (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET)) {
      ctx.addIssue({ code: 'custom', path: ['GOOGLE_CLIENT_ID'], message: 'google needs a client id and secret' });
    }
  });
