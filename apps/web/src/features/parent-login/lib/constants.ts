export const PIN_LOCK_STORAGE_KEY = 'lbd.pinLock';

export const PIN_FREE_ATTEMPTS = 5;

export const PIN_LOCK_BASE_MS = 30_000;

export const PIN_LOCK_MAX_MS = 15 * 60_000;

export const NO_PIN_LOCK = { failures: 0, until: 0 } as const;
