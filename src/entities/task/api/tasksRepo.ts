import { createCatalogue } from '@/shared/api/catalogue';
import { storedTaskSchema, type Task } from '../model/schema';

export const tasksCatalogue = createCatalogue<Task>('tasks', (rows) => storedTaskSchema.array().parse(rows));
