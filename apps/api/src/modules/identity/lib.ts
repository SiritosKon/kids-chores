import { argon2, createHash, createHmac, pbkdf2, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { createParamDecorator, type ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { CookieSerializeOptions } from '@fastify/cookie';
import type { FastifyRequest } from 'fastify';
import {
  ACCOUNT_NAME_MAX,
  API_PREFIX,
  emailSchema,
  phoneSchema,
  providerPictureSchema,
  SESSION_KEY_PREFIX,
  type AuthProvider,
  type Contact,
  type MailLocale,
  type PinHash,
  type Session,
} from '@kids-chores/contracts';
import type { AppConfig } from '../../platform/config';
import {
  ARGON2_MEMORY_KIB,
  ARGON2_PARALLELISM,
  ARGON2_PASSES,
  ARGON2_SALT_BYTES,
  ARGON2_TAG_BYTES,
  AUTH_STATE_TTL_SECONDS,
  CONTACT_HASH_PREFIX,
  EMAIL_CODE_LENGTH,
  EMAIL_CODE_MAILS,
  EMAIL_CODE_PREFIX,
  EMAIL_CODE_SENT_PREFIX,
  EMAIL_CODE_TTL_SECONDS,
  FAMILY_SESSIONS_PREFIX,
  GMAIL_DOMAINS,
  HOME_ROUTE,
  INVITE_HASH_PREFIX,
  INVITE_MAILS,
  INVITE_TOKEN_BYTES,
  JOIN_ROUTE,
  MAIL_DATE_FORMAT,
  PASSWORD_FAILS_PREFIX,
  PASSWORD_GRANT_PREFIX,
  PASSWORD_HASH_PATTERN,
  PIN_DIGEST_BYTES,
  PIN_GRANT_PREFIX,
  REAUTH_CLOCK_SKEW_SECONDS,
  STEP_UP_FAILS_PREFIX,
  STEP_UP_PREFIX,
  SESSION_TOKEN_BYTES,
  SESSION_TTL_SECONDS,
} from './constants';
import { providerProfileSchema } from './schema';
import type { MailMessage } from '../../platform/mail';
import type {
  ContactHash,
  EmailCodePurpose,
  EmailParts,
  LinkReturn,
  MailText,
  PinResetOutcome,
  ProviderCredentials,
  ProviderIdentity,
} from './types';

export const newSessionToken = (): string => randomBytes(SESSION_TOKEN_BYTES).toString('base64url');

export const sessionKey = (token: string): string =>
  `${SESSION_KEY_PREFIX}${createHash('sha256').update(token).digest('hex')}`;

export const familySessionsKey = (familyId: string): string => `${FAMILY_SESSIONS_PREFIX}${familyId}`;

export const subjectHash = (pepper: string, provider: string, subject: string): string =>
  createHmac('sha256', pepper).update(`${provider}:${subject}`).digest('hex');

const splitEmail = (email: string): EmailParts => {
  const at = email.lastIndexOf('@');
  return { local: email.slice(0, at), domain: email.slice(at + 1) };
};

export const canonicalContact = (contact: Contact): string => {
  if (contact.kind === 'phone') {
    return contact.value;
  }
  const email = contact.value.trim().toLowerCase();
  const { local, domain } = splitEmail(email);
  if (!GMAIL_DOMAINS.includes(domain)) {
    return email;
  }
  return `${(local.split('+')[0] ?? local).replaceAll('.', '')}@gmail.com`;
};

export const contactHash = (pepper: string, contact: Contact): ContactHash => ({
  kind: contact.kind,
  hash: createHmac('sha256', pepper)
    .update(`${CONTACT_HASH_PREFIX}${contact.kind}:${canonicalContact(contact)}`)
    .digest('hex'),
});

export const newInviteToken = (): string => randomBytes(INVITE_TOKEN_BYTES).toString('base64url');

export const inviteTokenHash = (pepper: string, token: string): string =>
  createHmac('sha256', pepper).update(`${INVITE_HASH_PREFIX}${token}`).digest('hex');

export const sameHash = (left: string, right: string, encoding: BufferEncoding = 'hex'): boolean => {
  const a = Buffer.from(left, encoding);
  const b = Buffer.from(right, encoding);
  return a.length > 0 && a.length === b.length && timingSafeEqual(a, b);
};

export const newEmailCode = (): string =>
  randomInt(0, 10 ** EMAIL_CODE_LENGTH).toString().padStart(EMAIL_CODE_LENGTH, '0');

export const emailCodeHash = (pepper: string, purpose: EmailCodePurpose, subject: string, code: string): string =>
  createHmac('sha256', pepper).update(`${purpose}:${subject}:${code}`).digest('hex');

export const emailCodeKey = (purpose: EmailCodePurpose, subject: string): string =>
  `${EMAIL_CODE_PREFIX}${purpose}:${subject}`;

export const emailCodeSentKey = (purpose: EmailCodePurpose, subject: string): string =>
  `${EMAIL_CODE_SENT_PREFIX}${purpose}:${subject}`;

export const emailCodeMail = (purpose: EmailCodePurpose, locale: MailLocale, code: string): Omit<MailMessage, 'to'> =>
  fillMail(EMAIL_CODE_MAILS[purpose][locale], { code, minutes: String(EMAIL_CODE_TTL_SECONDS / 60) });

export const inviteUrl = (config: AppConfig, token: string): string =>
  `${publicOrigin(config)}${config.APP_PATH}${JOIN_ROUTE}${token}`;

export const fillMail = (text: MailText, values: Readonly<Record<string, string>>): Omit<MailMessage, 'to'> => {
  const fill = (template: string): string =>
    Object.entries(values).reduce((result, [key, value]) => result.replaceAll(`{${key}}`, value), template);
  return { subject: fill(text.subject), text: text.paragraphs.map(fill).join('\n\n') };
};

export const inviteMail = (
  locale: MailLocale,
  inviterName: string | null,
  link: string,
  expiresAt: Date
): Omit<MailMessage, 'to'> => {
  const text = INVITE_MAILS[locale];
  return fillMail(text, {
    name: inviterName ?? text.someone,
    link,
    date: new Intl.DateTimeFormat(locale, MAIL_DATE_FORMAT).format(expiresAt),
  });
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

export const pinGrantKey = (userId: string): string => `${PIN_GRANT_PREFIX}${userId}`;

export const stepUpKey = (userId: string): string => `${STEP_UP_PREFIX}${userId}`;

export const stepUpFailsKey = (userId: string): string => `${STEP_UP_FAILS_PREFIX}${userId}`;

const pbkdf2Async = promisify(pbkdf2);

const argon2Async = promisify(argon2);

const unpadded = (bytes: Buffer): string => bytes.toString('base64').replace(/=+$/, '');

const argon2id = (password: string, salt: Buffer, memory: number, passes: number, parallelism: number, tagLength: number) =>
  argon2Async('argon2id', { message: password, nonce: salt, memory, passes, parallelism, tagLength });

export const hashPassword = async (password: string, salt = randomBytes(ARGON2_SALT_BYTES)): Promise<string> => {
  const hash = await argon2id(password, salt, ARGON2_MEMORY_KIB, ARGON2_PASSES, ARGON2_PARALLELISM, ARGON2_TAG_BYTES);
  return `$argon2id$v=19$m=${ARGON2_MEMORY_KIB},t=${ARGON2_PASSES},p=${ARGON2_PARALLELISM}$${unpadded(salt)}$${unpadded(hash)}`;
};

export const verifyPassword = async (password: string, stored: string): Promise<boolean> => {
  const parts = PASSWORD_HASH_PATTERN.exec(stored);
  if (!parts) {
    return false;
  }
  const [, memory = '', passes = '', parallelism = '', salt = '', hash = ''] = parts;
  const expected = Buffer.from(hash, 'base64');
  const actual = await argon2id(
    password,
    Buffer.from(salt, 'base64'),
    Number(memory),
    Number(passes),
    Number(parallelism),
    expected.length
  );
  return actual.length === expected.length && timingSafeEqual(actual, expected);
};

export const pwnedCount = (body: string, suffix: string): number => {
  for (const line of body.split('\n')) {
    const [hash, count] = line.trim().split(':');
    if (hash?.toUpperCase() === suffix.toUpperCase()) {
      return Number(count) || 0;
    }
  }
  return 0;
};

export const passwordFailsKey = (emailHash: string): string => `${PASSWORD_FAILS_PREFIX}${emailHash}`;

export const passwordGrantKey = (userId: string): string => `${PASSWORD_GRANT_PREFIX}${userId}`;

export const pinDigest = async (pin: string, stored: PinHash): Promise<string> =>
  (await pbkdf2Async(pin, Buffer.from(stored.salt, 'base64'), stored.iterations, PIN_DIGEST_BYTES, 'sha256')).toString('base64');

export const pinResetUrl = (config: AppConfig, outcome: PinResetOutcome): string =>
  `${publicOrigin(config)}${config.APP_PATH}${HOME_ROUTE}?pinReset=${outcome}`;

export const linkedUrl = (config: AppConfig, outcome: LinkReturn): string =>
  `${publicOrigin(config)}${config.APP_PATH}${HOME_ROUTE}?linked=${outcome}`;

export const emailLinkSubject = (userId: string, contactHashValue: string): string => `${userId}:${contactHashValue}`;

export const failedSignInUrl = (config: AppConfig, error: string): string =>
  `${publicOrigin(config)}${config.APP_PATH}${HOME_ROUTE}?error=${encodeURIComponent(error)}`;

export const profileName = (claims: unknown): string | undefined => {
  const profile = providerProfileSchema.safeParse(claims);
  const name = profile.success ? (profile.data.given_name ?? profile.data.name)?.trim().slice(0, ACCOUNT_NAME_MAX).trim() : '';
  return name || undefined;
};

export const profilePicture = (claims: unknown): string | undefined => {
  const profile = providerProfileSchema.safeParse(claims);
  const picture = providerPictureSchema.safeParse(profile.success ? profile.data.picture : undefined);
  return picture.success ? picture.data : undefined;
};

export const profileEmail = (claims: unknown): string | undefined => {
  const profile = providerProfileSchema.safeParse(claims);
  const verified = profile.success && profile.data.email_verified === true ? profile.data.email : undefined;
  const email = emailSchema.safeParse(verified);
  return email.success ? email.data : undefined;
};

export const profilePhone = (claims: unknown): string | undefined => {
  const profile = providerProfileSchema.safeParse(claims);
  const number = profile.success && profile.data.phone_number_verified !== false ? profile.data.phone_number : undefined;
  const phone = phoneSchema.safeParse(number && !number.startsWith('+') ? `+${number}` : number);
  return phone.success ? phone.data : undefined;
};

export const googleOwnsMailbox = (email: string, claims: unknown): boolean => {
  const profile = providerProfileSchema.safeParse(claims);
  return GMAIL_DOMAINS.includes(splitEmail(email).domain) || (profile.success && profile.data.hd !== undefined);
};

export const providerIdentity = (provider: AuthProvider, subject: string, claims: unknown): ProviderIdentity => {
  const email = provider === 'google' ? profileEmail(claims) : undefined;
  const phone = provider === 'telegram' ? profilePhone(claims) : undefined;
  const emailContact: Contact[] = email ? [{ kind: 'email', value: email }] : [];
  return {
    subject,
    name: profileName(claims),
    picture: profilePicture(claims),
    contacts: [...emailContact, ...(phone ? [{ kind: 'phone' as const, value: phone }] : [])],
    linkable: email && googleOwnsMailbox(email, claims) ? emailContact : [],
    authTime: providerProfileSchema.safeParse(claims).data?.auth_time,
  };
};

export const freshSignIn = (startedAt: number | undefined, authTime: number | undefined): boolean =>
  startedAt !== undefined && authTime !== undefined && authTime >= startedAt - REAUTH_CLOCK_SKEW_SECONDS;

export const providerCredentials = (config: AppConfig, provider: AuthProvider): ProviderCredentials | null => {
  const [clientId, clientSecret] =
    provider === 'google'
      ? [config.GOOGLE_CLIENT_ID, config.GOOGLE_CLIENT_SECRET]
      : [config.TELEGRAM_CLIENT_ID, config.TELEGRAM_CLIENT_SECRET];
  return clientId && clientSecret ? { clientId, clientSecret } : null;
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
