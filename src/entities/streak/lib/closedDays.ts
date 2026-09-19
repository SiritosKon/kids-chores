export interface DayMark {
  date: string;
  taskId: string;
}

export const closedDaysFrom = (
  marks: readonly DayMark[],
  requiredTaskIds: readonly string[]
): string[] => {
  if (requiredTaskIds.length === 0) {
    return [];
  }

  const byDay = new Map<string, Set<string>>();
  for (const mark of marks) {
    const day = byDay.get(mark.date) ?? new Set<string>();
    day.add(mark.taskId);
    byDay.set(mark.date, day);
  }

  return [...byDay.entries()]
    .filter(([, done]) => requiredTaskIds.every((taskId) => done.has(taskId)))
    .map(([day]) => day)
    .sort();
};
