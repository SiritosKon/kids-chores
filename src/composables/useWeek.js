export function startOfWeek(date) {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  const weekday = day.getDay();
  const shiftToMonday = weekday === 0 ? -6 : 1 - weekday;
  day.setDate(day.getDate() + shiftToMonday);
  return day;
}

export function toDateKey(date) {
  const day = new Date(date);
  const year = day.getFullYear();
  const month = String(day.getMonth() + 1).padStart(2, '0');
  const dayOfMonth = String(day.getDate()).padStart(2, '0');
  return `${year}-${month}-${dayOfMonth}`;
}

export function weekDayKeys(date) {
  const start = startOfWeek(date);
  const keys = [];
  for (let offset = 0; offset < 7; offset += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + offset);
    keys.push(toDateKey(day));
  }
  return keys;
}

export function todayKey() {
  return toDateKey(new Date());
}
