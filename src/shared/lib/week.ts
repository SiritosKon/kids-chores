import { date } from 'quasar';

const startOfWeek = (input: Date | number): Date => {
  const day = date.startOfDate(input, 'day');
  return date.subtractFromDate(day, { days: date.getDayOfWeek(day) - 1 });
};

export const weekDayKeys = (input: Date | number): string[] => {
  const start = startOfWeek(input);
  return Array.from({ length: 7 }, (_, offset) =>
    date.formatDate(date.addToDate(start, { days: offset }), 'YYYY-MM-DD')
  );
};
