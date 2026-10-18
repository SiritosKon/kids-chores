import type { z } from 'zod';
import type { localeSchema } from './schema';
import type { messages } from './messages';

export type Locale = z.infer<typeof localeSchema>;

export type MessageSchema = (typeof messages)['ru'];

export interface LocalizedMessages<T> {
  ru: T;
  en: NoInfer<T>;
  es: NoInfer<T>;
}

export interface CalendarNames {
  months: string[];
  monthsShort: string[];
  days: string[];
  daysShort: string[];
}

declare module 'vue-i18n' {
  export interface DefineLocaleMessage extends MessageSchema {}
}
