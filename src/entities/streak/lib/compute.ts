import { shiftDayKey } from '@/shared/lib/date';

export interface StreakMilestoneInput {
  id: string;
  days: number;
  points?: number;
  rewardId?: string;
}

export interface StreakHit {
  milestoneId: string;
  days: number;
  day: string;
  points?: number;
  rewardId?: string;
}

export interface StreakSummary {
  current: number;
  best: number;
  lastClosedDate: string | null;
  hits: StreakHit[];
}

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

    for (const milestone of milestones) {
      if (run % milestone.days === 0) {
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
