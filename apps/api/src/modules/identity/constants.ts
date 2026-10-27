import type { ServerMetadata } from 'openid-client';

export const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;

export const SESSION_TOKEN_BYTES = 32;

export const AUTH_STATE_TTL_SECONDS = 10 * 60;

export const AUTH_STATE_PREFIX = 'auth:state:';

export const AUTH_STATE_COOKIE = 'lbd_auth_state';

export const PASSKEY_CHALLENGE_TTL_SECONDS = 5 * 60;

export const PASSKEY_REGISTER_PREFIX = 'auth:passkey:register:';

export const PASSKEY_LOGIN_PREFIX = 'auth:passkey:login:';

export const PASSKEY_RP_NAME = 'Little Big Deals';

export const DEV_PROVIDER = 'dev';

export const ACCOUNT_ROUTE = '#/account';

export const GOOGLE_SCOPE = 'openid email';

export const GOOGLE_SERVER: ServerMetadata = {
  issuer: 'https://accounts.google.com',
  authorization_endpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  token_endpoint: 'https://oauth2.googleapis.com/token',
  jwks_uri: 'https://www.googleapis.com/oauth2/v3/certs',
};
