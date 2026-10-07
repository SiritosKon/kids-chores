import { z } from 'zod';

const timestamp = z.number().int().nonnegative();

export const childGoalSchema = z.object({
  rewardId: z.string().min(1),
  variantId: z.string().min(1).optional(),
});

export const childSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  carColor: z.string().min(1),
  weeklyGoal: z.number().int().positive().optional(),
  photo: z.string(),
  goal: childGoalSchema.optional(),
  order: z.number().int().nonnegative(),
  active: z.boolean(),
  createdAt: timestamp,
  updatedAt: timestamp,
  archivedAt: timestamp.optional(),
});

