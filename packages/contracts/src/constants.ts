export const API_PREFIX = '/v1';

export const REGIONS = ['eu', 'ru'] as const;

export const EVENTS_STREAM = 'events';

export const AUTH_PROVIDERS = ['google', 'telegram'] as const;

export const SESSION_COOKIE = 'lbd_session';

export const SESSION_KEY_PREFIX = 'session:';

export const ACCOUNT_NAME_MAX = 40;

export const MEMBER_ROLES = ['owner', 'parent'] as const;

export const CONTACT_KINDS = ['email', 'phone'] as const;

export const EMAIL_MAX = 254;

export const PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;

export const PHONE_SEPARATORS = /[\s().-]/g;

export const CONTACT_HINT_MAX = 60;

export const FAMILY_HEADER = 'x-family-id';

export const PROVIDER_PICTURE_HOST = /(^|\.)googleusercontent\.com$/;

export const SYNC_KINDS = ['children', 'tasks', 'rewards', 'rewardVariants', 'settings', 'completions', 'spends'] as const;

export const SYNC_SCHEMA_VERSION = 1;

export const SYNC_PUSH_LIMIT = 200;

export const SYNC_PULL_LIMIT = 500;

export const SYNC_FIELDS_LIMIT = 40;

export const SYNC_RECORD_BYTES = 16_384;

export const SYNC_FIELD_PATTERN = /^[A-Za-z][A-Za-z0-9]{0,63}$/;
