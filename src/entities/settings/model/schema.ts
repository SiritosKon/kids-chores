import { z } from 'zod';

export const SETTINGS_ID = 'app';

export const bonusSettingsSchema = z.object({
  enabled: z.boolean(),
  points: z.number().int().nonnegative(),
});

export const streakMilestoneSchema = z.object({
  id: z.string().min(1),
  days: z.number().int().positive(),
  points: z.number().int().nonnegative().optional(),
  rewardId: z.string().min(1).optional(),
});

export const streakSettingsSchema = z.object({
  enabled: z.boolean(),
  milestones: z.array(streakMilestoneSchema),
});

export const settingsSchema = z.object({
  id: z.literal(SETTINGS_ID),
  parentPassword: z.string(),
  bonus: bonusSettingsSchema,
  streak: streakSettingsSchema,
});

export type BonusSettings = z.infer<typeof bonusSettingsSchema>;
export type StreakMilestone = z.infer<typeof streakMilestoneSchema>;
export type StreakSettings = z.infer<typeof streakSettingsSchema>;
export type Settings = z.infer<typeof settingsSchema>;

export const storedSettingsSchema = settingsSchema.extend({
  parentPassword: z.string().default(''),
  bonus: bonusSettingsSchema.default({ enabled: true, points: 1 }),
  streak: streakSettingsSchema.default({
    enabled: true,
    milestones: [
      { id: 'three-days', days: 3, points: 2 },
      { id: 'week', days: 7, points: 5 },
    ],
  }),
});
