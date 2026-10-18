import { i18n } from '@/shared/i18n';
import { RESERVED_TASK_NAMES } from './constants';

export const reservedTaskName = (taskId: string): string | undefined => {
  const key = RESERVED_TASK_NAMES[taskId];
  return key === undefined ? undefined : i18n.global.t(key);
};

export const isReservedTaskId = (taskId: string): boolean => taskId in RESERVED_TASK_NAMES;
