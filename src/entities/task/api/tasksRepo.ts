import { createCatalogue } from '@/shared/api/catalogue';
import { taskSchema, type Task } from '../model/schema';

export const tasksCatalogue = createCatalogue<Task>('tasks', (rows) => taskSchema.array().parse(rows));
