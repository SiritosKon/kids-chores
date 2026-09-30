import type { z } from 'zod';
import type {
  rewardVisibilitySchema,
  rewardSchema,
  rewardVariantSchema,
  variantPhotoSchema,
} from './schema';

export type RewardVisibility = z.infer<typeof rewardVisibilitySchema>;

export type Reward = z.infer<typeof rewardSchema>;

export type RewardVariant = z.infer<typeof rewardVariantSchema>;

export type VariantPhoto = z.infer<typeof variantPhotoSchema>;
