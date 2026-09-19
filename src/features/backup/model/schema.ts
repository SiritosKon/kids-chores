import { z } from 'zod';
import { storedCompletionSchema } from '@/entities/completion';
import { storedSpendSchema } from '@/entities/spend';

export const BACKUP_VERSION = 2;

export const backupSchema = z.object({
  version: z.number().int().optional(),
  exportedAt: z.string().optional(),
  completions: z.array(storedCompletionSchema),
  spends: z.array(storedSpendSchema).optional(),
});

export type Backup = z.infer<typeof backupSchema>;

export const describeIssues = (error: z.ZodError): string => {
  return error.issues
    .slice(0, 3)
    .map((issue) => {
      const path = issue.path.join('.');
      return path ? `${path}: ${issue.message}` : issue.message;
    })
    .join('; ');
};
