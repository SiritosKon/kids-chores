import { z } from 'zod';

const timestamp = z.number().int().nonnegative();

export const completionSchema = z.object({
  id: z.string().min(1),
  childId: z.string().min(1),
  taskId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  // Снимок стоимости задачи на момент отметки: правка задачи не двигает историю.
  points: z.number().int(),
  createdAt: timestamp,
  updatedAt: timestamp,
});

export type Completion = z.infer<typeof completionSchema>;

// Строки из IndexedDB и из старых JSON-бэкапов: таймстемпов там могло не быть,
// поэтому проставляем их при чтении, а не роняем всю историю.
export const storedCompletionSchema = completionSchema
  .extend({
    createdAt: timestamp.optional(),
    updatedAt: timestamp.optional(),
  })
  .transform((row): Completion => {
    const now = Date.now();
    return { ...row, createdAt: row.createdAt ?? now, updatedAt: row.updatedAt ?? now };
  });
