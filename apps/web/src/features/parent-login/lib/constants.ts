export const CHECK_FACTOR_RANGE = { min: 12, max: 19 } as const;

export const CHECK_MULTIPLIER_RANGE = { min: 3, max: 9 } as const;

export const CHECK_ADDEND_RANGE = { min: 125, max: 475 } as const;

export const CHECK_MINUEND_RANGE = { min: 400, max: 900 } as const;

export const CHECK_SUBTRAHEND_RANGE = { min: 125, max: 375 } as const;

export const CHECK_DIGIT_RANGE = { min: 6, max: 9 } as const;

export const CHECK_TERM_RANGE = { min: 11, max: 49 } as const;

export const PIN_LOCK_STORAGE_KEY = 'lbd.pinLock';

export const PIN_FREE_ATTEMPTS = 5;

export const PIN_LOCK_BASE_MS = 30_000;

export const PIN_LOCK_MAX_MS = 15 * 60_000;

export const NO_PIN_LOCK = { failures: 0, until: 0 } as const;
