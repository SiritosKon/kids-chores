import { z } from 'zod';
import { storedCompletionSchema } from '@/entities/completion';
import { storedSpendSchema } from '@/entities/spend';
import { childSchema } from '@/entities/child';
import { taskSchema } from '@/entities/task';
import { rewardSchema } from '@/entities/reward';
import { storedSettingsSchema } from '@/entities/settings';

export const BACKUP_VERSION = 3;

export const backupSchema = z.object({
  version: z.number().int().optional(),
  exportedAt: z.string().optional(),
  completions: z.array(storedCompletionSchema),
  spends: z.array(storedSpendSchema).optional(),
  children: z.array(childSchema).optional(),
  tasks: z.array(taskSchema).optional(),
  rewards: z.array(rewardSchema).optional(),
  settings: storedSettingsSchema.optional(),
});

export type Backup = z.infer<typeof backupSchema>;

export const describeIssues = (error: z.ZodError): string =>
  error.issues
    .slice(0, 3)
    .map((issue) => {
      const path = issue.path.join('.');
      return path ? `${path}: ${issue.message}` : issue.message;
    })
    .join('; ');
