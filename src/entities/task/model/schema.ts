import { z } from 'zod';
import { dayKeySchema, EARLIEST_DAY_KEY } from '@/shared/lib/date';

const timestamp = z.number().int().nonnegative();

export const taskPeriodSchema = z.object({
  from: dayKeySchema,
  to: dayKeySchema.optional(),
});

export const taskSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  icon: z.string().min(1),
  points: z.number().int(),
  color: z.string().min(1),
  order: z.number().int().nonnegative(),
  active: z.boolean(),
  activePeriods: z.array(taskPeriodSchema),
  createdAt: timestamp,
  updatedAt: timestamp,
});

export type TaskPeriod = z.infer<typeof taskPeriodSchema>;
export type Task = z.infer<typeof taskSchema>;

export const storedTaskSchema = taskSchema
  .extend({ activePeriods: z.array(taskPeriodSchema).optional() })
  .transform(
    (row): Task => ({
      ...row,
      activePeriods: row.activePeriods ?? (row.active ? [{ from: EARLIEST_DAY_KEY }] : []),
    })
  );
