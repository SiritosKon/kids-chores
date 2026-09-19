import { date } from 'quasar';

export const DAY_KEY_FORMAT = 'YYYY-MM-DD';

export function todayKey(): string {
  return date.formatDate(Date.now(), DAY_KEY_FORMAT);
}

/** 2026-09-19 → «суббота, 19 сентября» */
export function formatDayKeyLong(dayKey: string): string {
  return toDate(dayKey).toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

/** 2026-09-19 → «19.09.2026» */
export function formatDayKeyNumeric(dayKey: string): string {
  const [year, month, day] = dayKey.split('-');
  return `${day}.${month}.${year}`;
}

/** Таймстемп → «19.09.2026» */
export function formatTimestampNumeric(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/** Таймстемп → «19 сент.» */
export function formatTimestampShort(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function toDate(dayKey: string): Date {
  const [year = '0', month = '1', day = '1'] = dayKey.split('-');
  return new Date(Number(year), Number(month) - 1, Number(day));
}
