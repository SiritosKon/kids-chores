import type { StreakMilestoneInput } from './compute';

export interface StreakProgress {
  milestoneId: string;
  days: number;
  points?: number;
  rewardId?: string;
  achieved: number;
  remaining: number;
  ratio: number;
}

export const streakProgress = (
  current: number,
  milestones: readonly StreakMilestoneInput[]
): StreakProgress | null => {
  const candidates = milestones.map((milestone) => {
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
