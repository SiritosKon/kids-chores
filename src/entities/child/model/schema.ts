import { z } from 'zod';

const timestamp = z.number().int().nonnegative();

export const childSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  carColor: z.string().min(1),
  weeklyGoal: z.number().int().positive().optional(),
  photo: z.string(),
  order: z.number().int().nonnegative(),
  active: z.boolean(),
  createdAt: timestamp,
  updatedAt: timestamp,
  archivedAt: timestamp.optional(),
});

