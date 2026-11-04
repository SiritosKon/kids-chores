import { Inject, Injectable } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Redis } from 'ioredis';
import { API_PREFIX, SESSION_COOKIE, sessionSchema, type Session } from '@kids-chores/contracts';
import { APP_CONFIG, type AppConfig } from '../../platform/config';
import { VALKEY } from '../../platform/valkey';
import { SESSION_TTL_SECONDS } from './constants';
import { familySessionsKey, newSessionToken, sessionCookieOptions, sessionKey } from './lib';
import type { SignedIn } from './types';

@Injectable()
export class SessionsService {
  constructor(
    @Inject(VALKEY) private readonly valkey: Redis,
    @Inject(APP_CONFIG) private readonly config: AppConfig
  ) {}

  async touch(token: string): Promise<Session | null> {
    const raw = await this.valkey.getex(sessionKey(token), 'EX', SESSION_TTL_SECONDS);
    if (!raw) {
      return null;
    }
    const parsed = sessionSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      return null;
    }
    await this.valkey.expire(familySessionsKey(parsed.data.familyId), SESSION_TTL_SECONDS);
    return parsed.data;
  }

  async start(request: FastifyRequest, reply: FastifyReply, signedIn: SignedIn): Promise<void> {
    await this.forget(request);
    const token = newSessionToken();
    const session: Session = { ...signedIn, createdAt: new Date().toISOString() };
    const family = familySessionsKey(signedIn.familyId);
    await this.valkey
      .multi()
      .set(sessionKey(token), JSON.stringify(session), 'EX', SESSION_TTL_SECONDS)
      .sadd(family, sessionKey(token))
      .expire(family, SESSION_TTL_SECONDS)
      .exec();
    reply.setCookie(SESSION_COOKIE, token, sessionCookieOptions(this.config));
  }

  refreshCookie(reply: FastifyReply, token: string): void {
    reply.setCookie(SESSION_COOKIE, token, sessionCookieOptions(this.config));
  }

  async end(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    await this.forget(request);
    reply.clearCookie(SESSION_COOKIE, { path: API_PREFIX });
  }

  async endFamily(familyId: string, reply: FastifyReply): Promise<void> {
    const family = familySessionsKey(familyId);
    const keys = await this.valkey.smembers(family);
    await this.valkey.del(...keys, family);
    reply.clearCookie(SESSION_COOKIE, { path: API_PREFIX });
  }

  private async forget(request: FastifyRequest): Promise<void> {
    if (!request.sessionToken) {
      return;
    }
    const key = sessionKey(request.sessionToken);
    const multi = this.valkey.multi().del(key);
    if (request.authSession) {
      multi.srem(familySessionsKey(request.authSession.familyId), key);
    }
    await multi.exec();
  }
}
