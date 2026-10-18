import { z } from 'zod';

export const streakHitRuleSchema = z.enum(['every', 'once']);

export const streakStateSchema = z.object({
  childId: z.string().min(1),
  current: z.number().int().nonnegative(),
  best: z.number().int().nonnegative(),
  lastClosedDate: z.string().nullable(),
  celebrated: z.record(z.string(), z.number().int().nonnegative()).default({}),
  hitRule: streakHitRuleSchema.default('every'),
  updatedAt: z.number().int().nonnegative(),
});

