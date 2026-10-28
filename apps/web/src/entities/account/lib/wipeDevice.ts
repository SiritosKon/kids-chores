import { db } from '@/shared/api/db';
import { ACCOUNT_PHOTO_STORAGE_PREFIX } from './constants';
import { forgetPasskeyId } from './passkeyId';

const forgetAccountPhotos = (): void => {
  try {
    Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))
      .filter((key): key is string => key?.startsWith(ACCOUNT_PHOTO_STORAGE_PREFIX) === true)
      .forEach((key) => localStorage.removeItem(key));
  } catch {
    return;
  }
};

export const wipeDevice = async (): Promise<void> => {
  forgetPasskeyId();
  forgetAccountPhotos();
  await db.delete();
};
