import type { Task } from '../model/types';

export type TaskDraft = Pick<Task, 'name' | 'icon' | 'color' | 'points'>;
