import { ACCOUNT_PHOTO_STORAGE_PREFIX } from './constants';

export const storedAccountPhoto = (userId: string): string | null => {
  try {
    return localStorage.getItem(`${ACCOUNT_PHOTO_STORAGE_PREFIX}${userId}`);
  } catch {
    return null;
  }
};

export const storeAccountPhoto = (userId: string, photo: string | null): boolean => {
  try {
    const key = `${ACCOUNT_PHOTO_STORAGE_PREFIX}${userId}`;
    if (photo) {
      localStorage.setItem(key, photo);
    } else {
      localStorage.removeItem(key);
    }
    return true;
  } catch {
    return false;
  }
};
