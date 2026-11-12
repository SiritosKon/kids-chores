import type { ServerMetadata } from 'openid-client';
import type { AuthProvider } from '@kids-chores/contracts';
import type { OidcProvider } from './types';

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

export const CONTACT_HASH_PREFIX = 'contact:';

export const GMAIL_DOMAINS: readonly string[] = ['gmail.com', 'googlemail.com'];

export const HINT_MASK = '•••';

export const PHONE_HINT_DIGITS = 2;

export const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const JOIN_REQUEST_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const JOIN_REQUESTS_PER_DAY = 5;

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
