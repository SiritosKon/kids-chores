import { date } from 'quasar';

export const DAY_KEY_FORMAT = 'YYYY-MM-DD';

export const todayKey = (): string => {
  return date.formatDate(Date.now(), DAY_KEY_FORMAT);
};

export const shiftDayKey = (dayKey: string, days: number): string =>
  date.formatDate(date.addToDate(toDate(dayKey), { days }), DAY_KEY_FORMAT);

export const formatDayKeyLong = (dayKey: string): string => {
  return toDate(dayKey).toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
};

export const formatDayKeyNumeric = (dayKey: string): string => {
  const [year, month, day] = dayKey.split('-');
  return `${day}.${month}.${year}`;
};

export const formatTimestampNumeric = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatTimestampShort = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
};

const toDate = (dayKey: string): Date => {
  const [year = '0', month = '1', day = '1'] = dayKey.split('-');
  return new Date(Number(year), Number(month) - 1, Number(day));
};
