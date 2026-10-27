import { Inject, Injectable } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Redis } from 'ioredis';
import { API_PREFIX, SESSION_COOKIE, sessionSchema, type Session } from '@kids-chores/contracts';
import { APP_CONFIG, type AppConfig } from '../../platform/config';
import { VALKEY } from '../../platform/valkey';
import { SESSION_TTL_SECONDS } from './constants';
import { newSessionToken, sessionCookieOptions, sessionKey } from './lib';
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
    return parsed.success ? parsed.data : null;
  }

  async start(request: FastifyRequest, reply: FastifyReply, signedIn: SignedIn): Promise<void> {
    if (request.sessionToken) {
      await this.valkey.del(sessionKey(request.sessionToken));
    }
    const token = newSessionToken();
    const session: Session = { ...signedIn, createdAt: new Date().toISOString() };
    await this.valkey.set(sessionKey(token), JSON.stringify(session), 'EX', SESSION_TTL_SECONDS);
    reply.setCookie(SESSION_COOKIE, token, sessionCookieOptions(this.config));
  }

  refreshCookie(reply: FastifyReply, token: string): void {
    reply.setCookie(SESSION_COOKIE, token, sessionCookieOptions(this.config));
  }

  async end(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    if (request.sessionToken) {
      await this.valkey.del(sessionKey(request.sessionToken));
    }
    reply.clearCookie(SESSION_COOKIE, { path: API_PREFIX });
  }
}
