import { taskSchema, type Task } from './schema';

export const BONUS_TASK_ID = 'bonus';

export const TASKS: readonly Task[] = taskSchema.array().parse([
  { id: 'study', name: 'Учеба', icon: 'school', points: 1, color: '#0A84FF' },
  { id: 'order', name: 'Порядок', icon: 'cleaning_services', points: 1, color: '#30D158' },
  { id: 'reading', name: 'Чтение', icon: 'menu_book', points: 1, color: '#BF5AF2' },
  { id: 'bonus', name: 'Доп. баллы', icon: 'star', points: 1, color: '#FF9F0A' },
]);

// Бонус начисляется автоматически за все задачи дня, поэтому в списке
// отмечаемых задач он не участвует.
export const REGULAR_TASKS: readonly Task[] = TASKS.filter((task) => task.id !== BONUS_TASK_ID);

export const BONUS_TASK: Task | undefined = TASKS.find((task) => task.id === BONUS_TASK_ID);

export function taskName(taskId: string): string {
  return TASKS.find((task) => task.id === taskId)?.name ?? taskId;
}
