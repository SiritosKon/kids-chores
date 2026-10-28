import Dexie from 'dexie';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '@/shared/api/db';
import { LOCALE_CACHE_KEY } from '@/shared/i18n';
import { ACCOUNT_PHOTO_STORAGE_PREFIX, PASSKEY_ID_STORAGE_KEY } from './constants';
import { wipeDevice } from './wipeDevice';

const memoryStorage = () => {
  const items = new Map<string, string>();
  return {
    get length() {
      return items.size;
    },
    key: (index: number) => [...items.keys()][index] ?? null,
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => void items.set(key, value),
    removeItem: (key: string) => void items.delete(key),
    clear: () => items.clear(),
  };
};

describe('wipeDevice', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', memoryStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('removes the local database, every parent photo and the passkey id, and keeps the language', async () => {
    await db.table('settings').put({ id: 'main', parentPin: '123456' });
    localStorage.setItem(`${ACCOUNT_PHOTO_STORAGE_PREFIX}first`, 'data:image/jpeg;base64,AAAA');
    localStorage.setItem(`${ACCOUNT_PHOTO_STORAGE_PREFIX}second`, 'data:image/jpeg;base64,BBBB');
    localStorage.setItem(PASSKEY_ID_STORAGE_KEY, 'credential');
    localStorage.setItem(LOCALE_CACHE_KEY, 'es');

    await wipeDevice();

    expect(await Dexie.exists(db.name)).toBe(false);
    expect(localStorage.length).toBe(1);
    expect(localStorage.getItem(LOCALE_CACHE_KEY)).toBe('es');
  });
});
