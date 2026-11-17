import type { AuthProvider } from '@kids-chores/contracts';

export const LINKED_QUERY = 'linked';

export const PROVIDER_NAMES: Readonly<Record<AuthProvider, string>> = {
  google: 'linkSignIn.google',
  telegram: 'linkSignIn.telegram',
};

export const PROVIDER_ICONS: Readonly<Record<AuthProvider, string>> = {
  google: 'login',
  telegram: 'send',
};

export const SEND_ERRORS = {
  tooMany: 'linkSignIn.tooMany',
  offline: 'linkSignIn.offline',
  mismatch: 'linkSignIn.failed',
  failed: 'linkSignIn.failed',
} as const;

export const CODE_ERRORS = {
  wrong: 'linkSignIn.wrongCode',
  gone: 'linkSignIn.codeGone',
  taken: 'linkSignIn.emailTaken',
  offline: 'linkSignIn.offline',
  failed: 'linkSignIn.failed',
} as const;

export const CONFIRM_ERRORS = {
  wrong: 'linkSignIn.wrongPin',
  tooMany: 'linkSignIn.tooManyPins',
  offline: 'linkSignIn.offline',
  failed: 'linkSignIn.failed',
} as const;
