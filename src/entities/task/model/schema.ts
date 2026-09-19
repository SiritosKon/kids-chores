import { z } from 'zod';

const timestamp = z.number().int().nonnegative();

export const taskSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  icon: z.string().min(1),
  points: z.number().int(),
  color: z.string().min(1),
  order: z.number().int().nonnegative(),
  active: z.boolean(),
  createdAt: timestamp,
  updatedAt: timestamp,
});

export type Task = z.infer<typeof taskSchema>;
