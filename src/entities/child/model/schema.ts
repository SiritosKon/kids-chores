import { z } from 'zod';
import { METER_FIGURES } from '@/shared/ui/constants';

const timestamp = z.number().int().nonnegative();

export const childGoalSchema = z.object({
  rewardId: z.string().min(1),
  variantId: z.string().min(1).optional(),
});

export const childSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  carColor: z.string().min(1),
  figure: z.enum(METER_FIGURES).optional(),
  weeklyGoal: z.number().int().positive().optional(),
  photo: z.string(),
  goal: childGoalSchema.optional(),
  order: z.number().int().nonnegative(),
  active: z.boolean(),
  createdAt: timestamp,
  updatedAt: timestamp,
  archivedAt: timestamp.optional(),
});

