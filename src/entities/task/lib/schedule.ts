import type { Task, TaskPeriod } from '../model/types';

const coversDay = (period: TaskPeriod, day: string): boolean =>
  period.from <= day && (period.to === undefined || day < period.to);

const coversChild = (period: TaskPeriod, childId: string | undefined): boolean =>
  childId === undefined || period.childIds === undefined || period.childIds.includes(childId);

export const isTaskRequiredOn = (
  task: Pick<Task, 'activePeriods'>,
  day: string,
  childId?: string
): boolean => task.activePeriods.some((period) => coversDay(period, day) && coversChild(period, childId));

export const tasksRequiredOn = <Row extends Pick<Task, 'activePeriods'>>(
  tasks: readonly Row[],
  day: string,
  childId?: string
): Row[] => tasks.filter((task) => isTaskRequiredOn(task, day, childId));

export const sameChildren = (left?: readonly string[], right?: readonly string[]): boolean => {
  if (left === undefined || right === undefined) {
    return left === right;
  }
  return left.length === right.length && left.every((childId) => right.includes(childId));
};

const withChildren = (period: TaskPeriod, childIds: readonly string[] | undefined): TaskPeriod =>
  childIds === undefined ? period : { ...period, childIds: [...childIds] };

export const openPeriod = (
  periods: readonly TaskPeriod[],
  day: string,
  childIds?: readonly string[]
): TaskPeriod[] => {
  const last = periods.at(-1);
  if (last && last.to === undefined) {
    return [...periods];
  }
  if (last && last.to === day && sameChildren(last.childIds, childIds)) {
    return [...periods.slice(0, -1), withChildren({ from: last.from }, childIds)];
  }
  return [...periods, withChildren({ from: day }, childIds)];
};

export const closePeriod = (periods: readonly TaskPeriod[], day: string): TaskPeriod[] => {
  const last = periods.at(-1);
  if (!last || last.to !== undefined) {
    return [...periods];
  }
  if (last.from >= day) {
    return periods.slice(0, -1);
  }
  return [...periods.slice(0, -1), { ...last, to: day }];
};

export const reassignPeriods = (
  periods: readonly TaskPeriod[],
  day: string,
  childIds?: readonly string[]
): TaskPeriod[] => {
  const last = periods.at(-1);
  if (!last || last.to !== undefined || sameChildren(last.childIds, childIds)) {
    return [...periods];
  }
  return openPeriod(closePeriod(periods, day), day, childIds);
};
