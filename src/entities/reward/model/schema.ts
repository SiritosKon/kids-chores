import { z } from 'zod';

const timestamp = z.number().int().nonnegative();

export const rewardSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  icon: z.string().min(1),
  points: z.number().int().positive(),
  color: z.string().min(1).optional(),
  order: z.number().int().nonnegative(),
  active: z.boolean(),
  createdAt: timestamp,
  updatedAt: timestamp,
});

export type Reward = z.infer<typeof rewardSchema>;
