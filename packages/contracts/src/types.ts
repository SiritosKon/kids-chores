import type { AUTH_PROVIDERS, CONTACT_KINDS, MEMBER_ROLES, REGIONS } from './constants.js';

export type Region = (typeof REGIONS)[number];

export type AuthProvider = (typeof AUTH_PROVIDERS)[number];

export type MemberRole = (typeof MEMBER_ROLES)[number];

export type ContactKind = (typeof CONTACT_KINDS)[number];
