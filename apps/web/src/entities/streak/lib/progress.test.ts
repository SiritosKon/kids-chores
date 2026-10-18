import { describe, expect, it } from 'vitest';
import { streakProgress, isStageReached } from './progress';
import type { StreakMilestoneInput } from './types';

const STAGES: StreakMilestoneInput[] = [
  { id: 'fortnight', days: 15, rewardId: 'lego' },
  { id: 'week', days: 7, rewardId: 'bubble-tea' },
];

describe('streakProgress', () => {
  it('points at the nearest stage ahead', () => {
    const progress = streakProgress(2, STAGES);

    expect(progress?.milestoneId).toBe('week');
    expect(progress?.achieved).toBe(2);
    expect(progress?.remaining).toBe(5);
    expect(progress?.ratio).toBeCloseTo(2 / 7);
  });

  it('moves on to the next stage once one is reached', () => {
    const progress = streakProgress(7, STAGES);

    expect(progress?.milestoneId).toBe('fortnight');
    expect(progress?.remaining).toBe(8);
  });

  it('counts the whole run, not a cycle', () => {
    expect(streakProgress(10, STAGES)?.achieved).toBe(10);
  });

  it('returns nothing once every stage is passed', () => {
    expect(streakProgress(15, STAGES)).toBeNull();
    expect(streakProgress(40, STAGES)).toBeNull();
  });

  it('skips closed stages', () => {
    expect(streakProgress(2, [{ id: 'old', days: 3, to: '2026-09-01' }])).toBeNull();
  });

  it('returns nothing without stages', () => {
    expect(streakProgress(4, [])).toBeNull();
  });
});

describe('isStageReached', () => {
  it('marks stages the current run has reached', () => {
    expect(isStageReached(7, { id: 'week', days: 7 })).toBe(true);
    expect(isStageReached(6, { id: 'week', days: 7 })).toBe(false);
  });
});
