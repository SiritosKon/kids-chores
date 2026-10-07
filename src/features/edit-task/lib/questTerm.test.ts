import { describe, expect, it } from 'vitest';
import { questDatesError, termDates } from './questTerm';

const CUSTOM = { from: '2026-10-10', lastDay: '2026-10-12' };

describe('termDates', () => {
  it('counts a preset from today, today included', () => {
    expect(termDates('today', '2026-10-07', CUSTOM)).toEqual({ from: '2026-10-07', lastDay: '2026-10-07' });
    expect(termDates('tomorrow', '2026-10-07', CUSTOM)).toEqual({ from: '2026-10-07', lastDay: '2026-10-08' });
    expect(termDates('week', '2026-10-07', CUSTOM)).toEqual({ from: '2026-10-07', lastDay: '2026-10-13' });
  });

  it('takes the chosen dates for a custom term', () => {
    expect(termDates('custom', '2026-10-07', CUSTOM)).toEqual(CUSTOM);
  });
});

describe('questDatesError', () => {
  it('accepts a quest that ends today or later', () => {
    expect(questDatesError({ from: '2026-10-01', lastDay: '2026-10-07' }, '2026-10-07')).toBeNull();
    expect(questDatesError(CUSTOM, '2026-10-07')).toBeNull();
  });

  it('asks for both dates', () => {
    expect(questDatesError({ from: '', lastDay: '2026-10-08' }, '2026-10-07')).toBe('Укажите даты начала и конца');
  });

  it('rejects an end before the start', () => {
    expect(questDatesError({ from: '2026-10-09', lastDay: '2026-10-08' }, '2026-10-07')).toBe('Конец раньше начала');
  });

  it('rejects a quest that is already over', () => {
    expect(questDatesError({ from: '2026-10-01', lastDay: '2026-10-06' }, '2026-10-07')).toContain('не раньше сегодня');
  });
});
