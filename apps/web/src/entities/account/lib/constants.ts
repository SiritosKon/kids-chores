export const PASSKEY_ID_STORAGE_KEY = 'lbd.passkeyId';

export const ACCOUNT_STORAGE_KEY = 'lbd.account';

export const ACCOUNT_PHOTO_STORAGE_PREFIX = 'lbd.accountPhoto.';

export const PROVIDER_PHOTO_SIZE = 256;

export const PROVIDER_PHOTO_SIZE_SUFFIX = /=s\d+-c$/;

export const PASSWORD_ERRORS = {
  denied: 'passwordForm.denied',
  noEmail: 'passwordForm.noEmail',
  breached: 'passwordForm.breached',
  offline: 'passwordForm.offline',
  failed: 'passwordForm.failed',
} as const;
