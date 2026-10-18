import { FALLBACK_LOCALE, SUPPORTED_LOCALES } from './constants';
import type { CalendarNames, Locale, LocalizedMessages } from './types';

export const defineMessages = <T>(messages: LocalizedMessages<T>): LocalizedMessages<T> => messages;

export const detectLocale = (languages: readonly string[]): Locale => {
  for (const tag of languages) {
    const base = tag.toLowerCase().split('-')[0];
    const match = SUPPORTED_LOCALES.find((locale) => locale === base);
    if (match) {
      return match;
    }
  }
  return FALLBACK_LOCALE;
};

const russianRules = new Intl.PluralRules('ru');

export const russianPlural = (choice: number, choicesLength: number): number => {
  if (choicesLength < 3) {
    return Math.min(choicesLength - 1, Math.abs(choice) === 1 ? 0 : 1);
  }
  const form = russianRules.select(Math.abs(choice));
  if (form === 'one') {
    return 0;
  }
  return form === 'few' ? 1 : 2;
};


const capitalize = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

export const calendarNames = (dateLocale: string): CalendarNames => {
  const month = (style: 'long' | 'short', index: number): string =>
    capitalize(new Intl.DateTimeFormat(dateLocale, { month: style }).format(new Date(2026, index, 1)));
  const weekday = (style: 'long' | 'short', index: number): string =>
    capitalize(new Intl.DateTimeFormat(dateLocale, { weekday: style }).format(new Date(2026, 1, 1 + index)));
  const twelve = Array.from({ length: 12 }, (_, index) => index);
  const seven = Array.from({ length: 7 }, (_, index) => index);
  return {
    months: twelve.map((index) => month('long', index)),
    monthsShort: twelve.map((index) => month('short', index)),
    days: seven.map((index) => weekday('long', index)),
    daysShort: seven.map((index) => weekday('short', index)),
  };
};
