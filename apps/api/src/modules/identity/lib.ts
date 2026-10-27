import { createHash, createHmac, randomBytes } from 'node:crypto';
import { createParamDecorator, type ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { CookieSerializeOptions } from '@fastify/cookie';
import type { FastifyRequest } from 'fastify';
import { ACCOUNT_NAME_MAX, API_PREFIX, providerPictureSchema, SESSION_KEY_PREFIX, type Session } from '@kids-chores/contracts';
import type { AppConfig } from '../../platform/config';
import { ACCOUNT_ROUTE, AUTH_STATE_TTL_SECONDS, HOME_ROUTE, SESSION_TOKEN_BYTES, SESSION_TTL_SECONDS } from './constants';
import { googleProfileSchema } from './schema';

export const newSessionToken = (): string => randomBytes(SESSION_TOKEN_BYTES).toString('base64url');

export const sessionKey = (token: string): string =>
  `${SESSION_KEY_PREFIX}${createHash('sha256').update(token).digest('hex')}`;

export const subjectHash = (pepper: string, provider: string, subject: string): string =>
  createHmac('sha256', pepper).update(`${provider}:${subject}`).digest('hex');

export const sessionCookieOptions = (config: AppConfig): CookieSerializeOptions => ({
  httpOnly: true,
  secure: new URL(config.PUBLIC_ORIGIN).protocol === 'https:',
  sameSite: 'lax',
  path: API_PREFIX,
  maxAge: SESSION_TTL_SECONDS,
});

export const authStateCookieOptions = (config: AppConfig): CookieSerializeOptions => ({
  httpOnly: true,
  secure: new URL(config.PUBLIC_ORIGIN).protocol === 'https:',
  sameSite: 'lax',
  path: `${API_PREFIX}/auth`,
  maxAge: AUTH_STATE_TTL_SECONDS,
});

export const relyingPartyId = (config: AppConfig): string =>
  config.WEBAUTHN_RP_ID ?? new URL(config.PUBLIC_ORIGIN).hostname;

export const publicOrigin = (config: AppConfig): string => new URL(config.PUBLIC_ORIGIN).origin;

export const callbackUrl = (config: AppConfig, provider: string): string =>
  `${publicOrigin(config)}${API_PREFIX}/auth/${provider}/callback`;

export const accountUrl = (config: AppConfig, error: string): string =>
  `${publicOrigin(config)}${config.APP_PATH}${ACCOUNT_ROUTE}?error=${encodeURIComponent(error)}`;

export const profileName = (claims: unknown): string | undefined => {
  const profile = googleProfileSchema.safeParse(claims);
  const name = profile.success ? (profile.data.given_name ?? profile.data.name)?.trim().slice(0, ACCOUNT_NAME_MAX).trim() : '';
  return name || undefined;
};

export const profilePicture = (claims: unknown): string | undefined => {
  const profile = googleProfileSchema.safeParse(claims);
  const picture = providerPictureSchema.safeParse(profile.success ? profile.data.picture : undefined);
  return picture.success ? picture.data : undefined;
};

export const homeUrl = (config: AppConfig, signedIn: string, picture?: string): string =>
  `${publicOrigin(config)}${config.APP_PATH}${HOME_ROUTE}?signedIn=${encodeURIComponent(signedIn)}${
    picture ? `&picture=${encodeURIComponent(picture)}` : ''
  }`;

export const CurrentSession = createParamDecorator((_: unknown, context: ExecutionContext): Session => {
  const session = context.switchToHttp().getRequest<FastifyRequest>().authSession;
  if (!session) {
    throw new UnauthorizedException();
  }
  return session;
});
