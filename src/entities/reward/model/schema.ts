import { z } from 'zod';

const timestamp = z.number().int().nonnegative();

export const rewardVisibilitySchema = z.enum(['shop', 'streak', 'hidden']);

export const rewardSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  icon: z.string().min(1),
  points: z.number().int().positive(),
  color: z.string().min(1).optional(),
  purchasable: z.boolean().default(true),
  visibility: rewardVisibilitySchema.default('shop'),
  order: z.number().int().nonnegative(),
  active: z.boolean(),
  createdAt: timestamp,
  updatedAt: timestamp,
});

export type RewardVisibility = z.infer<typeof rewardVisibilitySchema>;
export type Reward = z.infer<typeof rewardSchema>;
