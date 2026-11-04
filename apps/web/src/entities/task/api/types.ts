import type { QuestDates, Task } from '../model/types';

export type TaskDraft = Pick<Task, 'name' | 'icon' | 'color' | 'points'>;

export interface TaskOptions {
  childIds?: readonly string[];
  quest?: QuestDates;
}
