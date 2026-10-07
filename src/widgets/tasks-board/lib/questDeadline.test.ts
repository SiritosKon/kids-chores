import { describe, expect, it } from 'vitest';
import { questDeadlineLabel } from './questDeadline';

describe('questDeadlineLabel', () => {
  it('counts the days left including today', () => {
    expect(questDeadlineLabel('2026-10-09', '2026-10-07')).toBe('ещё 2 дня');
    expect(questDeadlineLabel('2026-10-12', '2026-10-07')).toBe('ещё 5 дней');
  });

  it('warns on the last day', () => {
    expect(questDeadlineLabel('2026-10-08', '2026-10-07')).toBe('последний день');
  });
});
