export { streakStateSchema } from './model/schema';
export type { StreakState } from './model/types';
export { streaksTable, getStreaks, saveStreaks } from './api/streaksRepo';
export { useStreakStore } from './model/store';
export { streakProgress, isStageReached } from './lib/progress';
export { isStreakShown } from './lib/badge';
export { STREAK_BADGE_MIN_DAYS } from './lib/constants';
export { closedDaysFrom } from './lib/closedDays';
export { summariseStreak, isMilestoneActiveOn, isMilestoneOpen } from './lib/compute';
export type {
  DayMark,
  StreakHit,
  StreakMilestoneInput,
  StreakProgress,
  StreakSummary,
} from './lib/types';
