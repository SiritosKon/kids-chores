import { createCatalogue } from '@/shared/api/catalogue';
import { storedTaskSchema } from '../model/schema';
import type { Task } from '../model/types';

export const tasksCatalogue = createCatalogue<Task>('tasks', (rows) => storedTaskSchema.array().parse(rows));
