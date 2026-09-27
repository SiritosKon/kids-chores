import { RESERVED_TASK_NAMES } from './constants';

export const reservedTaskName = (taskId: string): string | undefined => RESERVED_TASK_NAMES[taskId];

export const isReservedTaskId = (taskId: string): boolean => taskId in RESERVED_TASK_NAMES;
