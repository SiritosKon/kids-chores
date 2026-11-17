import { createHmac } from 'node:crypto';
import { isIPv6 } from 'node:net';
import { SetMetadata } from '@nestjs/common';
import { AUTH_RATE_LIMIT, IPV4_MAPPED, IPV6_GROUPS, IPV6_PREFIX_GROUPS, RATE_LIMIT_PREFIX } from './constants';
import type { RateLimitBucket, RateLimitCheck } from './types';

export const AuthRateLimit = (): MethodDecorator & ClassDecorator => SetMetadata(AUTH_RATE_LIMIT, true);

const ipv6Groups = (ip: string): string[] => {
  const [head = '', tail] = ip.split('%')[0]?.split('::') ?? [];
  const left = head === '' ? [] : head.split(':');
  if (tail === undefined) {
    return left;
  }
  const right = tail === '' ? [] : tail.split(':');
  return [...left, ...Array<string>(Math.max(IPV6_GROUPS - left.length - right.length, 0)).fill('0'), ...right];
};

export const ipSubject = (ip: string): string => {
  const mapped = IPV4_MAPPED.exec(ip)?.[1];
  if (mapped) {
    return mapped;
  }
  if (!isIPv6(ip)) {
    return ip;
  }
  const prefix = ipv6Groups(ip)
    .slice(0, IPV6_PREFIX_GROUPS)
    .map((group) => Number.parseInt(group, 16).toString(16));
  return `${prefix.join(':')}::/64`;
};

export const rateLimitChecks = (ip: string, sessionToken: string | undefined, auth: boolean): RateLimitCheck[] => {
  const client = ipSubject(ip);
  const checks: RateLimitCheck[] = [{ bucket: 'ip', subject: client }];
  if (auth) {
    checks.push({ bucket: 'auth', subject: client });
  }
  if (sessionToken) {
    checks.push({ bucket: 'session', subject: sessionToken });
  }
  return checks;
};

export const rateLimitKey = (secret: string, bucket: RateLimitBucket, subject: string): string =>
  `${RATE_LIMIT_PREFIX}${bucket}:${createHmac('sha256', secret).update(subject).digest('base64url')}`;
