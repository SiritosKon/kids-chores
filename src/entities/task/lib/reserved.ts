export const BONUS_TASK_ID = 'bonus';
export const STREAK_TASK_ID = 'streak';

const RESERVED_NAMES: Readonly<Record<string, string>> = {
  [BONUS_TASK_ID]: 'Доп. баллы',
  [STREAK_TASK_ID]: 'Серия',
};

export const RESERVED_TASK_IDS = Object.keys(RESERVED_NAMES);

export const reservedTaskName = (taskId: string): string | undefined => RESERVED_NAMES[taskId];

export const isReservedTaskId = (taskId: string): boolean => taskId in RESERVED_NAMES;
