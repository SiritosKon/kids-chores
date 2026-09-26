export { streakStateSchema, type StreakState } from './model/schema';
export { streaksTable, getStreaks, saveStreaks } from './api/streaksRepo';
export { useStreakStore } from './model/store';
export { streakProgress, type StreakProgress } from './lib/progress';
export { isStreakShown, STREAK_BADGE_MIN_DAYS } from './lib/badge';
export { closedDaysFrom, type DayMark } from './lib/closedDays';
export {
  summariseStreak,
  isMilestoneActiveOn,
  isMilestoneOpen,
  type StreakSummary,
  type StreakHit,
  type StreakMilestoneInput,
} from './lib/compute';
