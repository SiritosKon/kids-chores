import type { z } from 'zod';
import type {
  bonusSettingsSchema,
  settingsSchema,
  streakMilestoneSchema,
  streakSettingsSchema,
} from './schema';

export type BonusSettings = z.infer<typeof bonusSettingsSchema>;

export type StreakMilestone = z.infer<typeof streakMilestoneSchema>;

export type StreakSettings = z.infer<typeof streakSettingsSchema>;

export type Settings = z.infer<typeof settingsSchema>;
