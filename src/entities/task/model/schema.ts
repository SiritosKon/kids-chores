import { z } from 'zod';
import { dayKeySchema } from '@/shared/lib/date';
import { EARLIEST_DAY_KEY } from '@/shared/lib/constants';
import type { Task } from './types';

const timestamp = z.number().int().nonnegative();

const childIdsSchema = z.array(z.string().min(1)).min(1);

export const taskPeriodSchema = z.object({
  from: dayKeySchema,
  to: dayKeySchema.optional(),
  childIds: childIdsSchema.optional(),
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
  childIds: childIdsSchema.optional(),
  createdAt: timestamp,
  updatedAt: timestamp,
  archivedAt: timestamp.optional(),
});

export const storedTaskSchema = taskSchema
  .extend({ activePeriods: z.array(taskPeriodSchema).optional() })
  .transform(
    (row): Task => ({
      ...row,
      activePeriods: row.activePeriods ?? (row.active ? [{ from: EARLIEST_DAY_KEY }] : []),
    })
  );
