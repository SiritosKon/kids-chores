import type { StreakMilestone } from '../model/types';
import type { MilestoneRule } from './types';

const isOpen = (milestone: StreakMilestone): boolean => milestone.to === undefined;

const sameChildren = (first: readonly string[] | undefined, second: readonly string[] | undefined): boolean =>
  [...(first ?? [])].sort().join() === [...(second ?? [])].sort().join();

const sameRule = (milestone: StreakMilestone, rule: MilestoneRule): boolean =>
  milestone.days === rule.days &&
  (milestone.points ?? 0) === (rule.points ?? 0) &&
  milestone.rewardId === rule.rewardId &&
  sameChildren(milestone.childIds, rule.childIds);

const isForChild = (milestone: Pick<StreakMilestone, 'childIds'>, childId: string): boolean =>
  milestone.childIds === undefined || milestone.childIds.includes(childId);

const shareChildren = (
  milestone: Pick<StreakMilestone, 'childIds'>,
  childIds: readonly string[] | undefined
): boolean =>
  milestone.childIds === undefined ||
  childIds === undefined ||
  childIds.some((childId) => isForChild(milestone, childId));

const closeOn = (milestone: StreakMilestone, today: string): StreakMilestone[] =>
  milestone.from !== undefined && milestone.from >= today ? [] : [{ ...milestone, to: today }];

const openFrom = (rule: MilestoneRule, today: string, id: string): StreakMilestone => ({
  id,
  days: rule.days,
  from: today,
  ...(rule.points ? { points: rule.points } : {}),
  ...(rule.rewardId ? { rewardId: rule.rewardId } : {}),
  ...(rule.childIds && rule.childIds.length > 0 ? { childIds: [...rule.childIds] } : {}),
});

export const milestonesFor = (milestones: readonly StreakMilestone[], childId: string): StreakMilestone[] =>
  milestones.filter((milestone) => isForChild(milestone, childId));

export const openMilestones = (milestones: readonly StreakMilestone[]): StreakMilestone[] =>
  milestones.filter(isOpen).sort((first, second) => first.days - second.days);

export const isStageDaysTaken = (
  milestones: readonly StreakMilestone[],
  days: number,
  childIds: readonly string[] | undefined,
  exceptId: string | null
): boolean =>
  openMilestones(milestones).some(
    (milestone) => milestone.days === days && milestone.id !== exceptId && shareChildren(milestone, childIds)
  );

export const addMilestone = (
  milestones: readonly StreakMilestone[],
  rule: MilestoneRule,
  today: string,
  newId: string
): StreakMilestone[] => [...milestones, openFrom(rule, today, newId)];

export const changeMilestone = (
  milestones: readonly StreakMilestone[],
  milestoneId: string,
  rule: MilestoneRule,
  today: string,
  newId: string
): StreakMilestone[] => {
  const target = milestones.find((milestone) => milestone.id === milestoneId && isOpen(milestone));
  if (!target || sameRule(target, rule)) {
    return [...milestones];
  }
  return [...removeMilestone(milestones, milestoneId, today), openFrom(rule, today, newId)];
};

export const removeMilestone = (
  milestones: readonly StreakMilestone[],
  milestoneId: string,
  today: string
): StreakMilestone[] =>
  milestones.flatMap((milestone) =>
    milestone.id === milestoneId && isOpen(milestone) ? closeOn(milestone, today) : [milestone]
  );
