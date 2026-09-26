import type { Task, TaskPeriod } from '../model/schema';

const covers = (period: TaskPeriod, day: string): boolean =>
  period.from <= day && (period.to === undefined || day < period.to);

export const isTaskRequiredOn = (task: Pick<Task, 'activePeriods'>, day: string): boolean =>
  task.activePeriods.some((period) => covers(period, day));

export const tasksRequiredOn = <Row extends Pick<Task, 'activePeriods'>>(
  tasks: readonly Row[],
  day: string
): Row[] => tasks.filter((task) => isTaskRequiredOn(task, day));
