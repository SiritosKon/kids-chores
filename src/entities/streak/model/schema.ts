import { z } from 'zod';

export const streakStateSchema = z.object({
  childId: z.string().min(1),
  current: z.number().int().nonnegative(),
  best: z.number().int().nonnegative(),
  lastClosedDate: z.string().nullable(),
  updatedAt: z.number().int().nonnegative(),
});

export type StreakState = z.infer<typeof streakStateSchema>;
