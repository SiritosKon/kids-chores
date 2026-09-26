import { createCatalogue } from '@/shared/api/catalogue';
import { storedTaskSchema } from '../model/schema';
import { openPeriod, closePeriod } from '../lib/schedule';
import type { Task } from '../model/types';
import type { TaskDraft } from './types';

export const tasksCatalogue = createCatalogue<Task>('tasks', (rows) =>
  storedTaskSchema.array().parse(rows)
);

export const createTask = async (draft: TaskDraft, today: string): Promise<Task> => {
  const now = Date.now();
  const task: Task = {
    ...draft,
    id: crypto.randomUUID(),
    order: await tasksCatalogue.nextOrder(),
    active: true,
    activePeriods: [{ from: today }],
    createdAt: now,
    updatedAt: now,
  };
  await tasksCatalogue.put(task);
  return task;
};

export const updateTask = (taskId: string, draft: TaskDraft): Promise<void> =>
  tasksCatalogue.update(taskId, draft);

export const setTaskActive = async (taskId: string, active: boolean, today: string): Promise<void> => {
  const task = await tasksCatalogue.get(taskId);
  if (!task || task.active === active) {
    return;
  }
  await tasksCatalogue.update(taskId, {
    active,
    activePeriods: active
      ? openPeriod(task.activePeriods, today)
      : closePeriod(task.activePeriods, today),
  });
};

export const archiveTask = async (taskId: string, today: string): Promise<void> => {
  const task = await tasksCatalogue.get(taskId);
  if (task) {
    await tasksCatalogue.archive(taskId, { activePeriods: closePeriod(task.activePeriods, today) });
  }
};
