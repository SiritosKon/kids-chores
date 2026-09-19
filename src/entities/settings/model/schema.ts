import { z } from 'zod';

export const SETTINGS_ID = 'app';
export const PARENT_PIN_LENGTH = 6;
export const DEFAULT_PARENT_PIN = '546949';

const PIN_PATTERN = /^\d{6}$/;

export const parentPinSchema = z.string().regex(PIN_PATTERN);

export const isValidPin = (value: string): boolean => PIN_PATTERN.test(value);

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
  parentPin: parentPinSchema,
  bonus: bonusSettingsSchema,
  streak: streakSettingsSchema,
});

export type BonusSettings = z.infer<typeof bonusSettingsSchema>;
export type StreakMilestone = z.infer<typeof streakMilestoneSchema>;
export type StreakSettings = z.infer<typeof streakSettingsSchema>;
export type Settings = z.infer<typeof settingsSchema>;

const DEFAULT_BONUS: BonusSettings = { enabled: true, points: 1 };

const DEFAULT_STREAK: StreakSettings = {
  enabled: true,
  milestones: [
    { id: 'three-days', days: 3, rewardId: 'icecream-shop' },
    { id: 'week', days: 7, rewardId: 'icecream-cafe' },
  ],
};

export const storedSettingsSchema = z
  .object({
    id: z.literal(SETTINGS_ID),
    parentPin: z.string().optional(),
    parentPassword: z.string().optional(),
    bonus: bonusSettingsSchema.default(DEFAULT_BONUS),
    streak: streakSettingsSchema.default(DEFAULT_STREAK),
  })
  .transform((row): Settings => {
    const stored = row.parentPin ?? row.parentPassword ?? '';
    return {
      id: row.id,
      parentPin: isValidPin(stored) ? stored : DEFAULT_PARENT_PIN,
      bonus: row.bonus,
      streak: row.streak,
    };
  });
