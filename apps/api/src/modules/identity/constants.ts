import type { ServerMetadata } from 'openid-client';
import type { AuthProvider, MailLocale } from '@kids-chores/contracts';
import type { EmailCodePurpose, InviteMailText, MailText, OidcProvider } from './types';

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

export const JOIN_ROUTE = '#/join/';

export const CONTACT_HASH_PREFIX = 'contact:';

export const GMAIL_DOMAINS: readonly string[] = ['gmail.com', 'googlemail.com'];

export const INVITE_TOKEN_BYTES = 32;

export const INVITE_HASH_PREFIX = 'invite:';

export const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const JOIN_REQUEST_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const JOIN_REQUESTS_PER_DAY = 5;

export const INVITE_MAILS_PER_DAY = 10;

export const INVITE_MAILS_PER_ADDRESS = 3;

export const INVITE_MAILS_PER_ADDRESS_TOTAL = 10;

export const INVITE_MAILS_PER_IP = 20;

export const INVITE_MAILS_PER_DAY_TOTAL = 300;

export const EMAIL_CODE_LENGTH = 6;

export const EMAIL_CODE_TTL_SECONDS = 10 * 60;

export const EMAIL_CODE_RESEND_SECONDS = 60;

export const EMAIL_CODE_ATTEMPTS = 5;

export const EMAIL_CODE_PREFIX = 'code:';

export const EMAIL_CODE_SENT_PREFIX = 'code:sent:';

export const EMAIL_CODE_MAILS: Readonly<Record<EmailCodePurpose, Readonly<Record<MailLocale, MailText>>>> = {
  pin: {
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
  },
  signIn: {
    ru: {
      subject: 'Little Big Deals: код для входа',
      paragraphs: [
        'Код для входа в Little Big Deals: {code}',
        'Он действует {minutes} минут. Если вы не входили в приложение, просто удалите это письмо.',
      ],
    },
    en: {
      subject: 'Little Big Deals: your sign-in code',
      paragraphs: [
        'Your code to sign in to Little Big Deals: {code}',
        'It works for {minutes} minutes. If you did not try to sign in, just delete this email.',
      ],
    },
    es: {
      subject: 'Little Big Deals: código para entrar',
      paragraphs: [
        'Tu código para entrar en Little Big Deals: {code}',
        'Sirve durante {minutes} minutos. Si no intentaste entrar, borra este correo.',
      ],
    },
  },
};

export const MAIL_DATE_FORMAT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };

export const INVITE_MAILS: Readonly<Record<MailLocale, InviteMailText>> = {
  ru: {
    subject: 'Приглашение в семью в Little Big Deals',
    paragraphs: [
      '{name} зовёт вас в семью в Little Big Deals — приложении, где дети отмечают домашние дела и копят баллы на награды.',
      'Откройте ссылку и войдите в приложение — после входа вы сразу окажетесь в семье:',
      '{link}',
      'Ссылка одноразовая и действует до {date}. Если вы не ждали приглашения, просто удалите это письмо.',
    ],
    someone: 'Родитель',
  },
  en: {
    subject: 'An invitation to a family in Little Big Deals',
    paragraphs: [
      '{name} invites you to their family in Little Big Deals, the app where kids tick off chores and save points for rewards.',
      "Open the link and sign in to the app — right after signing in you're in the family:",
      '{link}',
      "The link works once and is valid until {date}. If you weren't expecting an invitation, just delete this email.",
    ],
    someone: 'A parent',
  },
  es: {
    subject: 'Una invitación a una familia en Little Big Deals',
    paragraphs: [
      '{name} te invita a su familia en Little Big Deals, la app donde los niños marcan sus tareas y ahorran puntos para premios.',
      'Abre el enlace y entra en la app: justo después de entrar estarás en la familia:',
      '{link}',
      'El enlace sirve una sola vez y es válido hasta el {date}. Si no esperabas una invitación, borra este correo.',
    ],
    someone: 'Un padre o una madre',
  },
};

export const DAY_SECONDS = 24 * 60 * 60;

const GOOGLE_SERVER: ServerMetadata = {
  issuer: 'https://accounts.google.com',
  authorization_endpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  token_endpoint: 'https://oauth2.googleapis.com/token',
  jwks_uri: 'https://www.googleapis.com/oauth2/v3/certs',
};

const TELEGRAM_SERVER: ServerMetadata = {
  issuer: 'https://oauth.telegram.org',
  authorization_endpoint: 'https://oauth.telegram.org/auth',
  token_endpoint: 'https://oauth.telegram.org/token',
  jwks_uri: 'https://oauth.telegram.org/.well-known/jwks.json',
};

export const OIDC_PROVIDERS: Readonly<Record<AuthProvider, OidcProvider>> = {
  google: { server: GOOGLE_SERVER, scope: 'openid profile email', params: { prompt: 'select_account' } },
  telegram: { server: TELEGRAM_SERVER, scope: 'openid profile phone', params: {} },
};
