import { z } from 'zod';

const timestamp = z.number().int().nonnegative();

export const rewardVisibilitySchema = z.enum(['shop', 'streak', 'hidden', 'goal']);

export const rewardSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  icon: z.string().min(1),
  points: z.number().int().nonnegative(),
  color: z.string().min(1).optional(),
  purchasable: z.boolean().default(true),
  visibility: rewardVisibilitySchema.default('shop'),
  order: z.number().int().nonnegative(),
  active: z.boolean(),
  createdAt: timestamp,
  updatedAt: timestamp,
  archivedAt: timestamp.optional(),
});


export const rewardVariantSchema = z.object({
  id: z.string().min(1),
  rewardId: z.string().min(1),
  name: z.string().min(1),
  order: z.number().int().nonnegative(),
  active: z.boolean(),
  createdAt: timestamp,
  updatedAt: timestamp,
  archivedAt: timestamp.optional(),
});

export const variantPhotoSchema = z.object({
  id: z.string().min(1),
  photo: z.string(),
});
