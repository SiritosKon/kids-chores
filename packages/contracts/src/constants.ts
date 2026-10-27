export const API_PREFIX = '/v1';

export const REGIONS = ['eu', 'ru'] as const;

export const EVENTS_STREAM = 'events';

export const AUTH_PROVIDERS = ['google'] as const;

export const SESSION_COOKIE = 'lbd_session';

export const SESSION_KEY_PREFIX = 'session:';

export const SYNC_KINDS = ['children', 'tasks', 'rewards', 'rewardVariants', 'settings', 'completions', 'spends'] as const;

export const SYNC_SCHEMA_VERSION = 1;

export const SYNC_PUSH_LIMIT = 200;

export const SYNC_PULL_LIMIT = 500;

export const SYNC_FIELDS_LIMIT = 40;

export const SYNC_RECORD_BYTES = 16_384;

export const SYNC_FIELD_PATTERN = /^[A-Za-z][A-Za-z0-9]{0,63}$/;
