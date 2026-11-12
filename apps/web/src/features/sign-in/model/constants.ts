export const SIGNED_IN_QUERY = 'signedIn';

export const PICTURE_QUERY = 'picture';

export const SEND_ERRORS = {
  tooMany: 'signIn.tooMany',
  offline: 'signIn.offline',
  mismatch: 'signIn.failed',
  failed: 'signIn.failed',
} as const;

export const CODE_ERRORS = {
  wrong: 'signIn.wrongCode',
  gone: 'signIn.codeGone',
  offline: 'signIn.offline',
  failed: 'signIn.failed',
} as const;
