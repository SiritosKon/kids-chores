import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import type { Redis } from 'ioredis';
import { RATE_LIMIT_PREFIX } from '../../platform/rate-limit';
import { VALKEY } from '../../platform/valkey';
import { DAY_SECONDS, RELEASE_LIMITS_SCRIPT, RESERVE_LIMITS_SCRIPT } from './constants';
import type { DailyLimit } from './types';

@Injectable()
export class DailyLimitsService {
  constructor(@Inject(VALKEY) private readonly valkey: Redis) {}

  async reserve(limits: readonly DailyLimit[]): Promise<void> {
    if (limits.length === 0) {
      return;
    }
    const keys = limits.map(({ name }) => `${RATE_LIMIT_PREFIX}${name}`);
    const reserved = await this.valkey.eval(
      RESERVE_LIMITS_SCRIPT,
      keys.length,
      ...keys,
      DAY_SECONDS,
      ...limits.map(({ perDay }) => perDay)
    );
    if (reserved !== 1) {
      throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  async release(limits: readonly DailyLimit[]): Promise<void> {
    if (limits.length === 0) {
      return;
    }
    const keys = limits.map(({ name }) => `${RATE_LIMIT_PREFIX}${name}`);
    await this.valkey.eval(RELEASE_LIMITS_SCRIPT, keys.length, ...keys);
  }
}
