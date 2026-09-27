import type { StreakMilestone } from '../model/types';
import type { MilestoneRule } from './types';

const isOpen = (milestone: StreakMilestone): boolean => milestone.to === undefined;

const sameRule = (milestone: StreakMilestone, rule: MilestoneRule): boolean =>
  milestone.days === rule.days &&
  (milestone.points ?? 0) === (rule.points ?? 0) &&
  milestone.rewardId === rule.rewardId;

const closeOn = (milestone: StreakMilestone, today: string): StreakMilestone[] =>
  milestone.from !== undefined && milestone.from >= today ? [] : [{ ...milestone, to: today }];

export const currentMilestone = (milestones: readonly StreakMilestone[]): StreakMilestone | undefined =>
  milestones.find(isOpen);

export const replaceMilestone = (
  milestones: readonly StreakMilestone[],
  rule: MilestoneRule | null,
  today: string,
  newId: string
): StreakMilestone[] => {
  const open = currentMilestone(milestones);
  if (open && rule && sameRule(open, rule)) {
    return [...milestones];
  }
  const kept = milestones.flatMap((milestone) => (isOpen(milestone) ? closeOn(milestone, today) : [milestone]));
  if (!rule) {
    return kept;
  }
  return [
    ...kept,
    {
      id: newId,
      days: rule.days,
      from: today,
      ...(rule.points ? { points: rule.points } : {}),
      ...(rule.rewardId ? { rewardId: rule.rewardId } : {}),
    },
  ];
};
