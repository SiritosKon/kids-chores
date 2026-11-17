import type { AUTH_PROVIDERS, CONTACT_KINDS, MAIL_LOCALES, MEMBER_ROLES, REGIONS } from './constants.js';

export type Region = (typeof REGIONS)[number];

export type AuthProvider = (typeof AUTH_PROVIDERS)[number];

export type MemberRole = (typeof MEMBER_ROLES)[number];

export type ContactKind = (typeof CONTACT_KINDS)[number];

export type MailLocale = (typeof MAIL_LOCALES)[number];
