import type { AUTH_PROVIDERS, REGIONS } from './constants.js';

export type Region = (typeof REGIONS)[number];

export type AuthProvider = (typeof AUTH_PROVIDERS)[number];
