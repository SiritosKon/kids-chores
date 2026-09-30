import { isMilestoneOpen } from './compute';
import type { StreakMilestoneInput, StreakProgress } from './types';

export const streakProgress = (
  current: number,
  milestones: readonly StreakMilestoneInput[]
): StreakProgress | null => {
  const next = milestones
    .filter((milestone) => isMilestoneOpen(milestone) && milestone.days > current)
    .sort((first, second) => first.days - second.days)[0];

  if (!next) {
    return null;
  }

  return {
    milestoneId: next.id,
    days: next.days,
    ...(next.points === undefined ? {} : { points: next.points }),
    ...(next.rewardId === undefined ? {} : { rewardId: next.rewardId }),
    achieved: current,
    remaining: next.days - current,
    ratio: current / next.days,
  };
};

export const isStageReached = (current: number, milestone: StreakMilestoneInput): boolean =>
  current >= milestone.days;
