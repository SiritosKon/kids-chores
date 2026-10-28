import { z } from 'zod';
import { storedCompletionSchema } from '@/entities/completion';
import { storedSpendSchema } from '@/entities/spend';
import { childSchema } from '@/entities/child';
import { storedTaskSchema } from '@/entities/task';
import { rewardSchema, rewardVariantSchema, variantPhotoSchema } from '@/entities/reward';
import { storedSettingsSchema } from '@/entities/settings';

export const backupSchema = z.object({
  version: z.number().int().optional(),
  exportedAt: z.string().optional(),
  completions: z.array(storedCompletionSchema),
  spends: z.array(storedSpendSchema).optional(),
  children: z.array(childSchema).optional(),
  tasks: z.array(storedTaskSchema).optional(),
  rewards: z.array(rewardSchema).optional(),
  rewardVariants: z.array(rewardVariantSchema).optional(),
  variantPhotos: z.array(variantPhotoSchema).optional(),
  settings: storedSettingsSchema.optional(),
});

export const describeIssues = (error: z.ZodError): string =>
  error.issues
    .slice(0, 3)
    .map((issue) => {
      const path = issue.path.join('.');
      return path ? `${path}: ${issue.message}` : issue.message;
    })
    .join('; ');
