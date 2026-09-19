export { streakStateSchema, type StreakState } from './model/schema';
export { streaksTable, getStreaks, saveStreaks } from './api/streaksRepo';
export { useStreakStore } from './model/store';
export {
  summariseStreak,
  type StreakSummary,
  type StreakHit,
  type StreakMilestoneInput,
} from './lib/compute';
