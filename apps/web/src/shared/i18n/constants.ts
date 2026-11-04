import langRu from 'quasar/lang/ru';
import langEn from 'quasar/lang/en-US';
import langEs from 'quasar/lang/es';

export const SUPPORTED_LOCALES = ['ru', 'en', 'es'] as const;

export const FALLBACK_LOCALE = 'en';

export const LEGACY_LOCALE = 'ru';

export const LOCALE_CACHE_KEY = 'kids-chores:locale';

export const LOCALE_NAMES = { ru: 'Русский', en: 'English', es: 'Español' } as const;

export const LOCALE_OPTIONS = SUPPORTED_LOCALES.map((value) => ({ value, label: LOCALE_NAMES[value] }));

export const DATE_LOCALES = { ru: 'ru-RU', en: 'en-US', es: 'es-ES' } as const;

export const QUASAR_LANGS = { ru: langRu, en: langEn, es: langEs } as const;

export const FIRST_DAY_OF_WEEK = { ru: 1, en: 0, es: 1 } as const;
