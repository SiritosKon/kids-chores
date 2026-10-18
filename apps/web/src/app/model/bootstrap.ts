import { trimRemovedTasks } from '@/entities/task';
import { recalculateStreaks } from '@/features/track-streak';

export const bootstrap = async (): Promise<void> => {
  await trimRemovedTasks();
  await recalculateStreaks();
};
