import { Inject, Injectable } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Redis } from 'ioredis';
import { API_PREFIX, SESSION_COOKIE, sessionSchema, type Session } from '@kids-chores/contracts';
import { APP_CONFIG, type AppConfig } from '../../platform/config';
import { PrismaService } from '../../platform/database';
import { VALKEY } from '../../platform/valkey';
import { SESSION_TTL_SECONDS } from './constants';
import { familySessionsKey, newSessionToken, sessionCookieOptions, sessionKey } from './lib';
import type { SignedIn } from './types';

@Injectable()
export class SessionsService {
  constructor(
    @Inject(VALKEY) private readonly valkey: Redis,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    private readonly prisma: PrismaService
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

  async confirm(token: string, session: Session): Promise<Session | null> {
    const membership = await this.prisma.membership.findUnique({
      where: { userId: session.userId },
      select: { familyId: true },
    });
    const key = sessionKey(token);
    if (!membership) {
      await this.valkey.multi().del(key).srem(familySessionsKey(session.familyId), key).exec();
      return null;
    }
    if (membership.familyId === session.familyId) {
      return session;
    }
    const moved: Session = { ...session, familyId: membership.familyId };
    const target = familySessionsKey(moved.familyId);
    await this.valkey
      .multi()
      .set(key, JSON.stringify(moved), 'KEEPTTL')
      .srem(familySessionsKey(session.familyId), key)
      .sadd(target, key)
      .expire(target, SESSION_TTL_SECONDS)
      .exec();
    return moved;
  }

  async start(request: FastifyRequest, reply: FastifyReply, signedIn: SignedIn): Promise<string> {
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
    return token;
  }

  refreshCookie(reply: FastifyReply, token: string): void {
    reply.setCookie(SESSION_COOKIE, token, sessionCookieOptions(this.config));
  }

  async end(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    await this.forget(request);
    reply.clearCookie(SESSION_COOKIE, { path: API_PREFIX });
  }

  async moveUser(from: string, to: string, userId: string): Promise<void> {
    const source = familySessionsKey(from);
    const target = familySessionsKey(to);
    for (const key of await this.valkey.smembers(source)) {
      const session = await this.read(key);
      if (session === null) {
        await this.valkey.srem(source, key);
      } else if (session.userId === userId) {
        await this.valkey
          .multi()
          .set(key, JSON.stringify({ ...session, familyId: to }), 'KEEPTTL')
          .srem(source, key)
          .sadd(target, key)
          .expire(target, SESSION_TTL_SECONDS)
          .exec();
      }
    }
  }

  async endUser(familyId: string, userId: string, keepToken?: string): Promise<void> {
    const family = familySessionsKey(familyId);
    const kept = keepToken ? sessionKey(keepToken) : null;
    for (const key of await this.valkey.smembers(family)) {
      if (key === kept) {
        continue;
      }
      const session = await this.read(key);
      if (session === null || session.userId === userId) {
        await this.valkey.multi().del(key).srem(family, key).exec();
      }
    }
  }

  clearCookie(reply: FastifyReply): void {
    reply.clearCookie(SESSION_COOKIE, { path: API_PREFIX });
  }

  async endFamily(familyId: string, reply: FastifyReply): Promise<void> {
    const family = familySessionsKey(familyId);
    const keys = await this.valkey.smembers(family);
    await this.valkey.del(...keys, family);
    reply.clearCookie(SESSION_COOKIE, { path: API_PREFIX });
  }

  private async read(key: string): Promise<Session | null> {
    const raw = await this.valkey.get(key);
    const parsed = sessionSchema.safeParse(raw ? JSON.parse(raw) : null);
    return parsed.success ? parsed.data : null;
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
