import { reservedTaskName, BONUS_TASK_ID } from '@/entities/task';

export const BONUS_ROW = {
  name: reservedTaskName(BONUS_TASK_ID) ?? 'Бонус',
  icon: 'star',
  color: '#FF9F0A',
};

export const CHECK_COLORS = ['blue', 'red'];
