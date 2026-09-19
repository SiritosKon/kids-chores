import { z } from 'zod';
import { storedCompletionSchema } from '@/entities/completion';
import { storedSpendSchema } from '@/entities/spend';

export const BACKUP_VERSION = 2;

// Файл приезжает от пользователя, поэтому схема — единственное, что стоит между
// чужим JSON и базой. Сущности валидируют себя сами, бэкап только их собирает.
export const backupSchema = z.object({
  version: z.number().int().optional(),
  exportedAt: z.string().optional(),
  completions: z.array(storedCompletionSchema),
  spends: z.array(storedSpendSchema).optional(),
});

export type Backup = z.infer<typeof backupSchema>;

export function describeIssues(error: z.ZodError): string {
  return error.issues
    .slice(0, 3)
    .map((issue) => {
      const path = issue.path.join('.');
      return path ? `${path}: ${issue.message}` : issue.message;
    })
    .join('; ');
}
