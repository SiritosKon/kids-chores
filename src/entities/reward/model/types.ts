import type { z } from 'zod';
import type { rewardVisibilitySchema, rewardSchema } from './schema';

export type RewardVisibility = z.infer<typeof rewardVisibilitySchema>;

export type Reward = z.infer<typeof rewardSchema>;
