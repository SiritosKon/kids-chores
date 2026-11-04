import { shiftDayKey } from '@/shared/lib/date';
import type { QuestDates, Task, TaskPeriod } from '../model/types';

const coversDay = (period: TaskPeriod, day: string): boolean =>
  period.from <= day && (period.to === undefined || day < period.to);

const coversChild = (period: TaskPeriod, childId: string | undefined): boolean =>
  childId === undefined || period.childIds === undefined || period.childIds.includes(childId);

const isActiveOn = (task: Pick<Task, 'activePeriods'>, day: string, childId: string | undefined): boolean =>
  task.activePeriods.some((period) => coversDay(period, day) && coversChild(period, childId));

export const isTaskRequiredOn = (
  task: Pick<Task, 'activePeriods' | 'quest'>,
  day: string,
  childId?: string
): boolean => task.quest !== true && isActiveOn(task, day, childId);

export const tasksRequiredOn = <Row extends Pick<Task, 'activePeriods' | 'quest'>>(
  tasks: readonly Row[],
  day: string,
  childId?: string
): Row[] => tasks.filter((task) => isTaskRequiredOn(task, day, childId));

export const isQuestOpenOn = (
  task: Pick<Task, 'activePeriods' | 'quest'>,
  day: string,
  childId?: string
): boolean => task.quest === true && isActiveOn(task, day, childId);

export const questsOpenOn = <Row extends Pick<Task, 'activePeriods' | 'quest'>>(
  tasks: readonly Row[],
  day: string,
  childId?: string
): Row[] => tasks.filter((task) => isQuestOpenOn(task, day, childId));

export const questDeadline = (task: Pick<Task, 'activePeriods'>): string | undefined =>
  task.activePeriods.at(-1)?.to;

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

export const questWindow = ({ from, lastDay }: QuestDates, childIds?: readonly string[]): TaskPeriod =>
  withChildren({ from, to: shiftDayKey(lastDay, 1) }, childIds);

export const questDates = (task: Pick<Task, 'activePeriods'>): QuestDates | undefined => {
  const period = task.activePeriods.at(-1);
  return period?.to === undefined ? undefined : { from: period.from, lastDay: shiftDayKey(period.to, -1) };
};

export const endPeriods = (periods: readonly TaskPeriod[], day: string): TaskPeriod[] =>
  periods
    .filter((period) => period.from < day)
    .map((period) => (period.to === undefined || period.to > day ? { ...period, to: day } : period));

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
