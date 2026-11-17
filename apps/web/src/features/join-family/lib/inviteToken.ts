import { INVITE_TOKEN_PATTERN } from '@kids-chores/contracts';
import { INVITE_TOKEN_STORAGE_KEY } from './constants';

export const storedInviteToken = (): string | null => {
  try {
    const token = localStorage.getItem(INVITE_TOKEN_STORAGE_KEY);
    return token !== null && INVITE_TOKEN_PATTERN.test(token) ? token : null;
  } catch {
    return null;
  }
};

export const storeInviteToken = (token: string): void => {
  try {
    localStorage.setItem(INVITE_TOKEN_STORAGE_KEY, token);
  } catch {
    return;
  }
};

export const forgetInviteToken = (): void => {
  try {
    localStorage.removeItem(INVITE_TOKEN_STORAGE_KEY);
  } catch {
    return;
  }
};
