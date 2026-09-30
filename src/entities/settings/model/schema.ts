import { z } from 'zod';
import { dayKeySchema } from '@/shared/lib/date';
import { SETTINGS_ID, PIN_PATTERN, LEGACY_BONUS, LEGACY_STREAK } from './constants';
import type { Settings } from './types';

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
  childIds: z.array(z.string().min(1)).min(1).optional(),
  from: dayKeySchema.optional(),
  to: dayKeySchema.optional(),
});

export const streakSettingsSchema = z.object({
  enabled: z.boolean(),
  milestones: z.array(streakMilestoneSchema),
});

export const settingsSchema = z.object({
  id: z.literal(SETTINGS_ID),
  parentPin: parentPinSchema.nullable(),
  bonus: bonusSettingsSchema,
  streak: streakSettingsSchema,
  tourPending: z.boolean(),
});

export const storedSettingsSchema = z
  .object({
    id: z.literal(SETTINGS_ID),
    parentPin: z.string().nullable().optional(),
    parentPassword: z.string().optional(),
    bonus: bonusSettingsSchema.default(LEGACY_BONUS),
    streak: streakSettingsSchema.default(LEGACY_STREAK),
    tourPending: z.boolean().default(false),
  })
  .transform((row): Settings => {
    const stored = row.parentPin ?? row.parentPassword ?? '';
    return {
      id: row.id,
      parentPin: isValidPin(stored) ? stored : null,
      bonus: row.bonus,
      streak: row.streak,
      tourPending: row.tourPending,
    };
  });
