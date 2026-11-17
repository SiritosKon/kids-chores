import type { z } from 'zod';
import type { taskPeriodSchema, taskSchema } from './schema';

export type TaskPeriod = z.infer<typeof taskPeriodSchema>;

export type Task = z.infer<typeof taskSchema>;

export interface QuestDates {
  from: string;
  lastDay: string;
}
