import {
  type CanActivate,
  type ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Redis } from 'ioredis';
import { SESSION_COOKIE } from '@kids-chores/contracts';
import { APP_CONFIG, type AppConfig } from '../config';
import { VALKEY } from '../valkey';
import { AUTH_RATE_LIMIT, RATE_LIMITS } from './constants';
import { rateLimitChecks, rateLimitKey } from './lib';
import { counterRepliesSchema } from './schema';
import type { RateLimitCheck } from './types';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(VALKEY) private readonly valkey: Redis,
    @Inject(APP_CONFIG) private readonly config: AppConfig
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp();
    const request = http.getRequest<FastifyRequest>();
    const auth = this.reflector.getAllAndOverride<boolean | undefined>(AUTH_RATE_LIMIT, [
      context.getHandler(),
      context.getClass(),
    ]);
    const checks = rateLimitChecks(request.ip, request.cookies[SESSION_COOKIE], auth === true);
    const waits = await Promise.all(checks.map((check) => this.hit(check)));
    const retryAfter = Math.max(...waits);
    if (retryAfter > 0) {
      http.getResponse<FastifyReply>().header('Retry-After', String(retryAfter));
      throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
    }
    return true;
  }

  private async hit({ bucket, subject }: RateLimitCheck): Promise<number> {
    const { limit, windowSeconds } = RATE_LIMITS[bucket];
    const key = rateLimitKey(this.config.AUTH_PEPPER, bucket, subject);
    const replies = await this.valkey.multi().set(key, 0, 'EX', windowSeconds, 'NX').incr(key).ttl(key).exec();
    const [, count, ttl] = counterRepliesSchema.parse(replies?.map(([, value]) => value));
    return count > limit ? Math.max(ttl, 1) : 0;
  }
}
