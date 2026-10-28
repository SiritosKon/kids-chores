import { z } from 'zod';
import { dayKeySchema } from '@/shared/lib/date';
import type { Completion } from './types';

const timestamp = z.number().int().nonnegative();

export const completionSchema = z.object({
  id: z.string().min(1),
  childId: z.string().min(1),
  taskId: z.string().min(1),
  date: dayKeySchema,
  points: z.number().int(),
  createdAt: timestamp,
  updatedAt: timestamp,
});

export const storedCompletionSchema = completionSchema
  .extend({
    createdAt: timestamp.optional(),
    updatedAt: timestamp.optional(),
  })
  .transform((row): Completion => {
    const now = Date.now();
    return { ...row, createdAt: row.createdAt ?? now, updatedAt: row.updatedAt ?? now };
  });
