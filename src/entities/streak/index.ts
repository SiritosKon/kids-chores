export { streakStateSchema, type StreakState } from './model/schema';
export { streaksTable, getStreaks, saveStreaks } from './api/streaksRepo';
export { useStreakStore } from './model/store';
export { streakProgress, type StreakProgress } from './lib/progress';
export {
  summariseStreak,
  type StreakSummary,
  type StreakHit,
  type StreakMilestoneInput,
} from './lib/compute';
