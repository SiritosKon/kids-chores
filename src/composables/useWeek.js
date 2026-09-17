import { date } from 'quasar';

// Начало недели держим явным (понедельник): у quasar/date week-start зависит от
// локали и не гарантирует Пн, а вся логика приложения завязана на Пн–Вс.
export function startOfWeek(input) {
  const day = new Date(input);
  day.setHours(0, 0, 0, 0);
  const weekday = day.getDay();
  const shiftToMonday = weekday === 0 ? -6 : 1 - weekday;
  day.setDate(day.getDate() + shiftToMonday);
  return day;
}

export function toDateKey(input) {
  return date.formatDate(input, 'YYYY-MM-DD');
}

export function weekDayKeys(input) {
  const start = startOfWeek(input);
  const keys = [];
  for (let offset = 0; offset < 7; offset += 1) {
    keys.push(toDateKey(date.addToDate(start, { days: offset })));
  }
  return keys;
}

export function todayKey() {
  return date.formatDate(Date.now(), 'YYYY-MM-DD');
}
