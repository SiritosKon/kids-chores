import type { Task, TaskPeriod } from '../model/types';

const covers = (period: TaskPeriod, day: string): boolean =>
  period.from <= day && (period.to === undefined || day < period.to);

export const isTaskRequiredOn = (task: Pick<Task, 'activePeriods'>, day: string): boolean =>
  task.activePeriods.some((period) => covers(period, day));

export const tasksRequiredOn = <Row extends Pick<Task, 'activePeriods'>>(
  tasks: readonly Row[],
  day: string
): Row[] => tasks.filter((task) => isTaskRequiredOn(task, day));

export const openPeriod = (periods: readonly TaskPeriod[], day: string): TaskPeriod[] => {
  const last = periods.at(-1);
  if (last && last.to === undefined) {
    return [...periods];
  }
  if (last && last.to === day) {
    return [...periods.slice(0, -1), { from: last.from }];
  }
  return [...periods, { from: day }];
};

export const closePeriod = (periods: readonly TaskPeriod[], day: string): TaskPeriod[] => {
  const last = periods.at(-1);
  if (!last || last.to !== undefined) {
    return [...periods];
  }
  if (last.from >= day) {
    return periods.slice(0, -1);
  }
  return [...periods.slice(0, -1), { from: last.from, to: day }];
};
