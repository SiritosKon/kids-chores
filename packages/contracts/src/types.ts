import type { AUTH_PROVIDERS, MAIL_LOCALES, REGIONS } from './constants.js';

export type Region = (typeof REGIONS)[number];

export type AuthProvider = (typeof AUTH_PROVIDERS)[number];

export type MailLocale = (typeof MAIL_LOCALES)[number];
