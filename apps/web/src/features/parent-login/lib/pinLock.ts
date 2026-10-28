import { NO_PIN_LOCK, PIN_FREE_ATTEMPTS, PIN_LOCK_BASE_MS, PIN_LOCK_MAX_MS, PIN_LOCK_STORAGE_KEY } from './constants';
import { pinLockSchema } from './schema';
import type { PinLock } from './types';

export const afterFailure = (lock: PinLock, now: number): PinLock => {
  const failures = lock.failures + 1;
  const over = failures - PIN_FREE_ATTEMPTS;
  return { failures, until: over < 0 ? 0 : now + Math.min(PIN_LOCK_BASE_MS * 2 ** over, PIN_LOCK_MAX_MS) };
};

const readLock = (): PinLock => {
  try {
    return pinLockSchema.parse(JSON.parse(localStorage.getItem(PIN_LOCK_STORAGE_KEY) ?? 'null'));
  } catch {
    return NO_PIN_LOCK;
  }
};

export const pinLockedFor = (now: number): number => Math.max(readLock().until - now, 0);

export const recordPinFailure = (now: number): number => {
  const next = afterFailure(readLock(), now);
  try {
    localStorage.setItem(PIN_LOCK_STORAGE_KEY, JSON.stringify(next));
  } catch {
    return 0;
  }
  return Math.max(next.until - now, 0);
};

export const clearPinFailures = (): void => {
  try {
    localStorage.removeItem(PIN_LOCK_STORAGE_KEY);
  } catch {
    return;
  }
};
