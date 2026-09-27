import { describe, expect, it } from 'vitest';
import { replaceMilestone, currentMilestone } from './milestones';

const WEEK = { id: 'week', days: 7, rewardId: 'bubble-tea' };

describe('replaceMilestone', () => {
  it('keeps the list when the rule did not change', () => {
    expect(replaceMilestone([WEEK], { days: 7, rewardId: 'bubble-tea' }, '2026-09-26', 'new')).toEqual([
      WEEK,
    ]);
  });

  it('closes the open milestone and starts a new one from today', () => {
    const next = replaceMilestone([WEEK], { days: 5, points: 3 }, '2026-09-26', 'new');

    expect(next).toEqual([
      { ...WEEK, to: '2026-09-26' },
      { id: 'new', days: 5, points: 3, from: '2026-09-26' },
    ]);
    expect(currentMilestone(next)?.id).toBe('new');
  });

  it('drops a milestone that started today instead of leaving an empty interval', () => {
    const today = { id: 'today', days: 5, points: 3, from: '2026-09-26' };

    expect(replaceMilestone([today], { days: 7, points: 3 }, '2026-09-26', 'new')).toEqual([
      { id: 'new', days: 7, points: 3, from: '2026-09-26' },
    ]);
  });

  it('only closes the open milestone when the rule is removed', () => {
    expect(replaceMilestone([WEEK], null, '2026-09-26', 'new')).toEqual([{ ...WEEK, to: '2026-09-26' }]);
  });

  it('leaves closed milestones untouched', () => {
    const old = { id: 'old', days: 3, points: 1, to: '2026-09-01' };

    expect(replaceMilestone([old, WEEK], { days: 10, rewardId: 'x' }, '2026-09-26', 'new')[0]).toEqual(old);
  });
});
