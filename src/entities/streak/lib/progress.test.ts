import { describe, expect, it } from 'vitest';
import { streakProgress } from './progress';
import type { StreakMilestoneInput } from './compute';

const MILESTONES: StreakMilestoneInput[] = [
  { id: 'three-days', days: 3, rewardId: 'icecream-shop' },
  { id: 'week', days: 7, rewardId: 'icecream-cafe' },
];

const WEEKLY: StreakMilestoneInput[] = [{ id: 'week', days: 7, rewardId: 'bubble-tea' }];

describe('streakProgress', () => {
  it('points at the milestone that comes soonest', () => {
    const progress = streakProgress(2, MILESTONES);

    expect(progress?.milestoneId).toBe('three-days');
    expect(progress?.remaining).toBe(1);
    expect(progress?.achieved).toBe(2);
  });

  it('starts a fresh cycle right after a milestone fires', () => {
    const progress = streakProgress(3, MILESTONES);

    expect(progress?.milestoneId).toBe('three-days');
    expect(progress?.achieved).toBe(0);
    expect(progress?.remaining).toBe(3);
  });

  it('prefers the shorter milestone when both are equally close', () => {
    const progress = streakProgress(0, MILESTONES);

    expect(progress?.milestoneId).toBe('three-days');
    expect(progress?.ratio).toBe(0);
  });

  it('switches to the weekly milestone when it is nearer', () => {
    const progress = streakProgress(6, MILESTONES);

    expect(progress?.milestoneId).toBe('week');
    expect(progress?.remaining).toBe(1);
  });

  it('measures the cycle, not the run: ten days in a row read as 3 of 7', () => {
    const progress = streakProgress(10, WEEKLY);

    expect(progress?.achieved).toBe(3);
    expect(progress?.days).toBe(7);
    expect(progress?.remaining).toBe(4);
    expect(progress?.ratio).toBeCloseTo(3 / 7);
  });

  it('empties the meter exactly on the milestone', () => {
    expect(streakProgress(7, WEEKLY)?.achieved).toBe(0);
    expect(streakProgress(14, WEEKLY)?.achieved).toBe(0);
    expect(streakProgress(21, WEEKLY)?.remaining).toBe(7);
  });

  it('returns nothing without milestones', () => {
    expect(streakProgress(4, [])).toBeNull();
  });
});
