export interface DayMark {
  date: string;
  taskId: string;
}

export const closedDaysFrom = (
  marks: readonly DayMark[],
  requiredOn: (day: string) => readonly string[]
): string[] => {
  const byDay = new Map<string, Set<string>>();
  for (const mark of marks) {
    const day = byDay.get(mark.date) ?? new Set<string>();
    day.add(mark.taskId);
    byDay.set(mark.date, day);
  }

  return [...byDay.entries()]
    .filter(([day, done]) => {
      const required = requiredOn(day);
      return required.length > 0 && required.every((taskId) => done.has(taskId));
    })
    .map(([day]) => day)
    .sort();
};
