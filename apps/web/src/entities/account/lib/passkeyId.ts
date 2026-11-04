import { PASSKEY_ID_STORAGE_KEY } from './constants';

export const rememberedPasskeyId = (): string | null => {
  try {
    return localStorage.getItem(PASSKEY_ID_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const rememberPasskeyId = (id: string): void => {
  try {
    localStorage.setItem(PASSKEY_ID_STORAGE_KEY, id);
  } catch {
    return;
  }
};

export const forgetPasskeyId = (): void => {
  try {
    localStorage.removeItem(PASSKEY_ID_STORAGE_KEY);
  } catch {
    return;
  }
};
