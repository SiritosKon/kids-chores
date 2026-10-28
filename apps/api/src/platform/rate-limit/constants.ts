import type { RateLimit, RateLimitBucket } from './types';

export const AUTH_RATE_LIMIT = 'authRateLimit';

export const RATE_LIMIT_PREFIX = 'rate:';

export const RATE_LIMITS: Readonly<Record<RateLimitBucket, RateLimit>> = {
  ip: { limit: 600, windowSeconds: 60 },
  auth: { limit: 30, windowSeconds: 300 },
  session: { limit: 300, windowSeconds: 60 },
};

export const IPV4_MAPPED = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i;

export const IPV6_GROUPS = 8;

export const IPV6_PREFIX_GROUPS = 4;
