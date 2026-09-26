import { isMilestoneOpen } from './compute';
import type { StreakMilestoneInput, StreakProgress } from './types';

export const streakProgress = (
  current: number,
  milestones: readonly StreakMilestoneInput[]
): StreakProgress | null => {
  const candidates = milestones.filter(isMilestoneOpen).map((milestone) => {
    const achieved = current % milestone.days;
    return {
      milestoneId: milestone.id,
      days: milestone.days,
      ...(milestone.points === undefined ? {} : { points: milestone.points }),
      ...(milestone.rewardId === undefined ? {} : { rewardId: milestone.rewardId }),
      achieved,
      remaining: milestone.days - achieved,
      ratio: achieved / milestone.days,
    };
  });

  return (
    candidates.sort(
      (first, second) => first.remaining - second.remaining || first.days - second.days
    )[0] ?? null
  );
};
