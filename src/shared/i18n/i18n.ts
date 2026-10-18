import { createI18n } from 'vue-i18n';
import type { QuasarLanguage } from 'quasar';
import { DATE_LOCALES, FALLBACK_LOCALE, FIRST_DAY_OF_WEEK, LOCALE_CACHE_KEY, QUASAR_LANGS } from './constants';
import { calendarNames, detectLocale, russianPlural } from './lib';
import { messages } from './messages';
import { localeSchema } from './schema';
import type { CalendarNames, Locale } from './types';

const readCachedLocale = (): Locale | undefined => {
  try {
    return localeSchema.safeParse(globalThis.localStorage?.getItem(LOCALE_CACHE_KEY)).data;
  } catch {
    return undefined;
  }
};

export const deviceLocale = (): Locale => detectLocale(globalThis.navigator?.languages ?? []);

export const i18n = createI18n({
  legacy: false,
  locale: readCachedLocale() ?? deviceLocale(),
  fallbackLocale: FALLBACK_LOCALE,
  messages,
  pluralRules: { ru: russianPlural },
});

export const currentLocale = (): Locale => localeSchema.catch(FALLBACK_LOCALE).parse(i18n.global.locale.value);

export const dateLocale = (): string => DATE_LOCALES[currentLocale()];

export const quasarLang = (): QuasarLanguage => QUASAR_LANGS[currentLocale()];

export const calendarLocale = (): CalendarNames => calendarNames(dateLocale());

export const firstDayOfWeek = (): number => FIRST_DAY_OF_WEEK[currentLocale()];

export const applyLocale = (locale: Locale): void => {
  i18n.global.locale.value = locale;
  if (typeof document === 'undefined') {
    return;
  }
  document.documentElement.lang = locale;
  try {
    globalThis.localStorage?.setItem(LOCALE_CACHE_KEY, locale);
  } catch {}
};
