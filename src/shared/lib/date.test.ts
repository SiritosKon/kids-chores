import { describe, expect, it } from 'vitest';
import { formatDayHeader } from './date';

describe('formatDayHeader', () => {
  it('spells out the weekday and the month', () => {
    expect(formatDayHeader('2026-09-25', '2026-09-26')).toBe('пятница, 25 сентября');
  });

  it('adds the year only for another year', () => {
    expect(formatDayHeader('2025-12-31', '2026-09-26')).toContain('2025');
  });
});
