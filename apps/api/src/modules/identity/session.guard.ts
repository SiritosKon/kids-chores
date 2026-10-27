import { type CanActivate, type ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { SESSION_COOKIE } from '@kids-chores/contracts';
import { IS_PUBLIC } from '../../platform/http';
import { SessionsService } from './sessions.service';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly sessions: SessionsService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp();
    const request = http.getRequest<FastifyRequest>();
    const token = request.cookies[SESSION_COOKIE];
    const session = token ? await this.sessions.touch(token) : null;
    if (token && session) {
      request.authSession = session;
      request.sessionToken = token;
      this.sessions.refreshCookie(http.getResponse<FastifyReply>(), token);
    }
    const isPublic = this.reflector.getAllAndOverride<boolean | undefined>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic === true || session) {
      return true;
    }
    throw new UnauthorizedException();
  }
}
