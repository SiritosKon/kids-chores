import { z } from 'zod';

export const rewardSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  icon: z.string().min(1),
  points: z.number().int().positive(),
});

export type Reward = z.infer<typeof rewardSchema>;
