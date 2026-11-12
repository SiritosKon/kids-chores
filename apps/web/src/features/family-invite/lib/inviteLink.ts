import { ROUTES } from '@/shared/config/constants';

export const inviteLink = (token: string): string =>
  `${new URL(import.meta.env.BASE_URL, window.location.origin).href}#${ROUTES.join.replace(':token', token)}`;
