import { describe, expect, it } from 'vitest';
import { PIN_FREE_ATTEMPTS, PIN_LOCK_BASE_MS, PIN_LOCK_MAX_MS } from './constants';
import { afterFailure } from './pinLock';
import type { PinLock } from './types';

const failTimes = (count: number, now: number): PinLock =>
  Array.from({ length: count }).reduce<PinLock>((lock) => afterFailure(lock, now), { failures: 0, until: 0 });

describe('afterFailure', () => {
  it('lets the first mistakes go without a pause', () => {
    expect(failTimes(PIN_FREE_ATTEMPTS - 1, 1000).until).toBe(0);
  });

  it('pauses after five mistakes in a row and doubles the pause with each next one', () => {
    expect(failTimes(PIN_FREE_ATTEMPTS, 1000).until).toBe(1000 + PIN_LOCK_BASE_MS);
    expect(failTimes(PIN_FREE_ATTEMPTS + 1, 1000).until).toBe(1000 + PIN_LOCK_BASE_MS * 2);
    expect(failTimes(PIN_FREE_ATTEMPTS + 2, 1000).until).toBe(1000 + PIN_LOCK_BASE_MS * 4);
  });

  it('never pauses longer than the cap', () => {
    expect(failTimes(PIN_FREE_ATTEMPTS + 20, 1000).until).toBe(1000 + PIN_LOCK_MAX_MS);
  });
});
