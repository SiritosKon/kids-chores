import { date } from 'quasar';

// Понедельник-старт недели держим явным: у quasar/date week-start зависит от
// локали и не гарантирует Пн, а вся логика приложения завязана на Пн–Вс.
function startOfWeek(input: Date | number): Date {
  const day = new Date(input);
  day.setHours(0, 0, 0, 0);
  const weekday = day.getDay();
  const shiftToMonday = weekday === 0 ? -6 : 1 - weekday;
  day.setDate(day.getDate() + shiftToMonday);
  return day;
}

export function weekDayKeys(input: Date | number): string[] {
  const start = startOfWeek(input);
  const keys: string[] = [];
  for (let offset = 0; offset < 7; offset += 1) {
    keys.push(date.formatDate(date.addToDate(start, { days: offset }), 'YYYY-MM-DD'));
  }
  return keys;
}
