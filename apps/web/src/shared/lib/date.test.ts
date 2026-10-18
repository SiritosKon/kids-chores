import { describe, expect, it } from 'vitest';
import { daysBetween, formatDayHeader } from './date';

describe('formatDayHeader', () => {
  it('spells out the weekday and the month', () => {
    expect(formatDayHeader('2026-09-25', '2026-09-26')).toBe('пятница, 25 сентября');
  });

  it('adds the year only for another year', () => {
    expect(formatDayHeader('2025-12-31', '2026-09-26')).toContain('2025');
  });
});

describe('daysBetween', () => {
  it('counts whole days from one day to another', () => {
    expect(daysBetween('2026-09-30', '2026-10-02')).toBe(2);
    expect(daysBetween('2026-10-02', '2026-09-30')).toBe(-2);
  });

  it('is not thrown off by the clock change', () => {
    expect(daysBetween('2026-10-24', '2026-10-26')).toBe(2);
    expect(daysBetween('2026-03-28', '2026-03-30')).toBe(2);
  });
});
