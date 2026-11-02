import { meResponseSchema, type MeResponse } from '@kids-chores/contracts';
import { ACCOUNT_STORAGE_KEY } from './constants';

export const rememberedAccount = (): MeResponse | null => {
  try {
    const parsed = meResponseSchema.safeParse(JSON.parse(localStorage.getItem(ACCOUNT_STORAGE_KEY) ?? 'null'));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
};

export const rememberAccount = (me: MeResponse): void => {
  try {
    localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(me));
  } catch {
    return;
  }
};

export const forgetAccount = (): void => {
  try {
    localStorage.removeItem(ACCOUNT_STORAGE_KEY);
  } catch {
    return;
  }
};
