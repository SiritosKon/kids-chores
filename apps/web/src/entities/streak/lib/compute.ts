import { shiftDayKey } from '@/shared/lib/date';
import type { StreakHit, StreakMilestoneInput, StreakSummary } from './types';

export const isMilestoneActiveOn = (milestone: StreakMilestoneInput, day: string): boolean =>
  (milestone.from === undefined || milestone.from <= day) &&
  (milestone.to === undefined || day < milestone.to);

export const isMilestoneOpen = (milestone: StreakMilestoneInput): boolean =>
  milestone.to === undefined;

export const summariseStreak = (
  closedDays: readonly string[],
  milestones: readonly StreakMilestoneInput[],
  today: string
): StreakSummary => {
  const days = [...new Set(closedDays)].filter((day) => day <= today).sort();
  const hits: StreakHit[] = [];
  let run = 0;
  let best = 0;
  let previous: string | null = null;

  for (const day of days) {
    run = previous !== null && shiftDayKey(previous, 1) === day ? run + 1 : 1;
    previous = day;
    best = Math.max(best, run);

    for (const milestone of milestones.filter((candidate) => isMilestoneActiveOn(candidate, day))) {
      if (run === milestone.days) {
        hits.push({
          milestoneId: milestone.id,
          days: milestone.days,
          day,
          ...(milestone.points === undefined ? {} : { points: milestone.points }),
          ...(milestone.rewardId === undefined ? {} : { rewardId: milestone.rewardId }),
        });
      }
    }
  }

  const lastClosedDate = days.at(-1) ?? null;
  const alive =
    lastClosedDate !== null &&
    (lastClosedDate === today || shiftDayKey(lastClosedDate, 1) === today);

  return { current: alive ? run : 0, best, lastClosedDate, hits };
};
