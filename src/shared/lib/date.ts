import { date } from 'quasar';

export const DAY_KEY_FORMAT = 'YYYY-MM-DD';

export function todayKey(): string {
  return date.formatDate(Date.now(), DAY_KEY_FORMAT);
}

export function formatDayKeyLong(dayKey: string): string {
  return toDate(dayKey).toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function formatDayKeyNumeric(dayKey: string): string {
  const [year, month, day] = dayKey.split('-');
  return `${day}.${month}.${year}`;
}

export function formatTimestampNumeric(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatTimestampShort(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function toDate(dayKey: string): Date {
  const [year = '0', month = '1', day = '1'] = dayKey.split('-');
  return new Date(Number(year), Number(month) - 1, Number(day));
}
