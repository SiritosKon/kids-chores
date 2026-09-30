import { describe, expect, it } from 'vitest';
import {
  addMilestone,
  changeMilestone,
  removeMilestone,
  openMilestones,
  isStageDaysTaken,
} from './milestones';

const WEEK = { id: 'week', days: 7, rewardId: 'bubble-tea' };
const FORTNIGHT = { id: 'fortnight', days: 15, rewardId: 'lego' };

describe('addMilestone', () => {
  it('opens a new stage from today next to the existing ones', () => {
    expect(addMilestone([WEEK], { days: 15, rewardId: 'lego' }, '2026-09-26', 'new')).toEqual([
      WEEK,
      { id: 'new', days: 15, rewardId: 'lego', from: '2026-09-26' },
    ]);
  });
});

describe('changeMilestone', () => {
  it('keeps the list when the rule did not change', () => {
    expect(changeMilestone([WEEK], 'week', { days: 7, rewardId: 'bubble-tea' }, '2026-09-26', 'new')).toEqual([
      WEEK,
    ]);
  });

  it('closes the edited stage and starts a new version from today', () => {
    const next = changeMilestone([WEEK, FORTNIGHT], 'week', { days: 5, points: 3 }, '2026-09-26', 'new');

    expect(next).toEqual([
      { ...WEEK, to: '2026-09-26' },
      FORTNIGHT,
      { id: 'new', days: 5, points: 3, from: '2026-09-26' },
    ]);
  });

  it('drops a stage that started today instead of leaving an empty interval', () => {
    const today = { id: 'today', days: 5, points: 3, from: '2026-09-26' };

    expect(changeMilestone([today], 'today', { days: 7, points: 3 }, '2026-09-26', 'new')).toEqual([
      { id: 'new', days: 7, points: 3, from: '2026-09-26' },
    ]);
  });

  it('leaves closed stages untouched', () => {
    const old = { id: 'old', days: 3, points: 1, to: '2026-09-01' };

    expect(changeMilestone([old, WEEK], 'old', { days: 10, rewardId: 'x' }, '2026-09-26', 'new')).toEqual([
      old,
      WEEK,
    ]);
  });
});

describe('removeMilestone', () => {
  it('closes only the removed stage', () => {
    expect(removeMilestone([WEEK, FORTNIGHT], 'week', '2026-09-26')).toEqual([
      { ...WEEK, to: '2026-09-26' },
      FORTNIGHT,
    ]);
  });
});

describe('openMilestones', () => {
  it('lists open stages from the shortest', () => {
    const closed = { id: 'old', days: 3, to: '2026-09-01' };

    expect(openMilestones([FORTNIGHT, closed, WEEK]).map((stage) => stage.id)).toEqual(['week', 'fortnight']);
  });
});

describe('isStageDaysTaken', () => {
  it('finds another open stage with the same length', () => {
    expect(isStageDaysTaken([WEEK, FORTNIGHT], 7, null)).toBe(true);
    expect(isStageDaysTaken([WEEK, FORTNIGHT], 7, 'week')).toBe(false);
    expect(isStageDaysTaken([{ ...WEEK, to: '2026-09-01' }], 7, null)).toBe(false);
  });
});
