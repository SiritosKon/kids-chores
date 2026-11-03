import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { createParamDecorator, type ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { CookieSerializeOptions } from '@fastify/cookie';
import type { FastifyRequest } from 'fastify';
import {
  ACCOUNT_NAME_MAX,
  API_PREFIX,
  emailSchema,
  PIN_CODE_LENGTH,
  providerPictureSchema,
  SESSION_KEY_PREFIX,
  type MailLocale,
  type Session,
} from '@kids-chores/contracts';
import type { AppConfig } from '../../platform/config';
import type { MailMessage } from '../../platform/mail';
import {
  AUTH_STATE_TTL_SECONDS,
  EMAIL_HASH_PREFIX,
  FAMILY_SESSIONS_PREFIX,
  HOME_ROUTE,
  PIN_CODE_MAILS,
  PIN_CODE_PREFIX,
  PIN_CODE_SENT_PREFIX,
  PIN_CODE_TTL_SECONDS,
  SESSION_TOKEN_BYTES,
  SESSION_TTL_SECONDS,
} from './constants';
import { googleProfileSchema } from './schema';

export const newSessionToken = (): string => randomBytes(SESSION_TOKEN_BYTES).toString('base64url');

export const sessionKey = (token: string): string =>
  `${SESSION_KEY_PREFIX}${createHash('sha256').update(token).digest('hex')}`;

export const familySessionsKey = (familyId: string): string => `${FAMILY_SESSIONS_PREFIX}${familyId}`;

export const subjectHash = (pepper: string, provider: string, subject: string): string =>
  createHmac('sha256', pepper).update(`${provider}:${subject}`).digest('hex');

export const emailHash = (pepper: string, email: string): string =>
  createHmac('sha256', pepper).update(`${EMAIL_HASH_PREFIX}${email.trim().toLowerCase()}`).digest('hex');

export const sameHash = (left: string, right: string): boolean => {
  const a = Buffer.from(left, 'hex');
  const b = Buffer.from(right, 'hex');
  return a.length > 0 && a.length === b.length && timingSafeEqual(a, b);
};

export const newPinCode = (): string => randomInt(0, 10 ** PIN_CODE_LENGTH).toString().padStart(PIN_CODE_LENGTH, '0');

export const pinCodeHash = (pepper: string, userId: string, code: string): string =>
  createHmac('sha256', pepper).update(`pin:${userId}:${code}`).digest('hex');

export const pinCodeKey = (userId: string): string => `${PIN_CODE_PREFIX}${userId}`;

export const pinCodeSentKey = (userId: string): string => `${PIN_CODE_SENT_PREFIX}${userId}`;

export const pinCodeMail = (locale: MailLocale, code: string): Omit<MailMessage, 'to'> => {
  const { subject, paragraphs } = PIN_CODE_MAILS[locale];
  const minutes = String(PIN_CODE_TTL_SECONDS / 60);
  return { subject, text: paragraphs.join('\n\n').replace('{code}', code).replace('{minutes}', minutes) };
};

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

export const failedSignInUrl = (config: AppConfig, error: string): string =>
  `${publicOrigin(config)}${config.APP_PATH}${HOME_ROUTE}?error=${encodeURIComponent(error)}`;

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

export const profileEmail = (claims: unknown): string | undefined => {
  const profile = googleProfileSchema.safeParse(claims);
  const verified = profile.success && profile.data.email_verified === true ? profile.data.email : undefined;
  const email = emailSchema.safeParse(verified);
  return email.success ? email.data : undefined;
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
