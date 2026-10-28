export const BONUS_TASK_ID = 'bonus';

export const STREAK_TASK_ID = 'streak';

export const RESERVED_TASK_NAMES: Readonly<Record<string, string>> = {
  [BONUS_TASK_ID]: 'taskEntity.reserved.bonus',
  [STREAK_TASK_ID]: 'taskEntity.reserved.streak',
};

export const RESERVED_TASK_IDS = Object.keys(RESERVED_TASK_NAMES);
