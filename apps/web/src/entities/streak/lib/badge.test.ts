import { describe, expect, it } from 'vitest';
import { isStreakShown } from './badge';

describe('isStreakShown', () => {
  it('hides the badge until the second day in a row', () => {
    expect(isStreakShown(0)).toBe(false);
    expect(isStreakShown(1)).toBe(false);
  });

  it('shows the badge from two days', () => {
    expect(isStreakShown(2)).toBe(true);
    expect(isStreakShown(7)).toBe(true);
  });
});
