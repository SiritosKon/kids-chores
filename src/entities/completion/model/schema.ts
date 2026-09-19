import { z } from 'zod';

const timestamp = z.number().int().nonnegative();

export const completionSchema = z.object({
  id: z.string().min(1),
  childId: z.string().min(1),
  taskId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  points: z.number().int(),
  createdAt: timestamp,
  updatedAt: timestamp,
});

export type Completion = z.infer<typeof completionSchema>;

export const storedCompletionSchema = completionSchema
  .extend({
    createdAt: timestamp.optional(),
    updatedAt: timestamp.optional(),
  })
  .transform((row): Completion => {
    const now = Date.now();
    return { ...row, createdAt: row.createdAt ?? now, updatedAt: row.updatedAt ?? now };
  });
