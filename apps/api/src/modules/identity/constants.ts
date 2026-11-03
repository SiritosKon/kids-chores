import type { ServerMetadata } from 'openid-client';
import type { MailLocale } from '@kids-chores/contracts';
import type { PinCodeMail } from './types';

export const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;

export const SESSION_TOKEN_BYTES = 32;

export const FAMILY_SESSIONS_PREFIX = 'sessions:family:';

export const AUTH_STATE_TTL_SECONDS = 10 * 60;

export const AUTH_STATE_PREFIX = 'auth:state:';

export const AUTH_STATE_COOKIE = 'lbd_auth_state';

export const PASSKEY_CHALLENGE_TTL_SECONDS = 5 * 60;

export const PASSKEY_REGISTER_PREFIX = 'auth:passkey:register:';

export const PASSKEY_LOGIN_PREFIX = 'auth:passkey:login:';

export const PASSKEY_RP_NAME = 'Little Big Deals';

export const DEV_PROVIDER = 'dev';

export const FAMILY_DELETED_EVENT = 'family.deleted';

export const FAMILY_DELETED_VERSION = 1;

export const HOME_ROUTE = '#/';

export const GOOGLE_SCOPE = 'openid profile email';

export const EMAIL_HASH_PREFIX = 'email:';

export const PIN_CODE_TTL_SECONDS = 10 * 60;

export const PIN_CODE_RESEND_SECONDS = 60;

export const PIN_CODE_ATTEMPTS = 5;

export const PIN_CODE_PREFIX = 'pin:code:';

export const PIN_CODE_SENT_PREFIX = 'pin:sent:';

export const PIN_CODE_MAILS: Readonly<Record<MailLocale, PinCodeMail>> = {
  ru: {
    subject: 'Little Big Deals: код для смены PIN',
    paragraphs: [
      'Код для смены родительского PIN в Little Big Deals: {code}',
      'Он действует {minutes} минут. Если вы не меняли PIN, просто удалите это письмо.',
    ],
  },
  en: {
    subject: 'Little Big Deals: your PIN change code',
    paragraphs: [
      'Your code to change the parent PIN in Little Big Deals: {code}',
      'It works for {minutes} minutes. If you did not ask to change the PIN, just delete this email.',
    ],
  },
  es: {
    subject: 'Little Big Deals: código para cambiar el PIN',
    paragraphs: [
      'Tu código para cambiar el PIN de padres en Little Big Deals: {code}',
      'Sirve durante {minutes} minutos. Si no pediste cambiar el PIN, borra este correo.',
    ],
  },
};

export const GOOGLE_SERVER: ServerMetadata = {
  issuer: 'https://accounts.google.com',
  authorization_endpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  token_endpoint: 'https://oauth2.googleapis.com/token',
  jwks_uri: 'https://www.googleapis.com/oauth2/v3/certs',
};
