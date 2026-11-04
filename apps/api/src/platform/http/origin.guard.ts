import { type CanActivate, type ExecutionContext, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { APP_CONFIG, type AppConfig } from '../config';
import { isTrustedOrigin } from './lib';

@Injectable()
export class OriginGuard implements CanActivate {
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    if (!isTrustedOrigin(request.method, request.headers.origin, this.config.PUBLIC_ORIGIN)) {
      throw new ForbiddenException();
    }
    return true;
  }
}
