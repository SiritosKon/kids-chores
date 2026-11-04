import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ACCOUNT_STORAGE_KEY } from './constants';
import { forgetAccount, rememberAccount, rememberedAccount } from './rememberedAccount';

const me = {
  userId: '6a1e0d7c-5f0b-4c2e-8b8d-9f2e3c4d5a6b',
  familyId: '0b8b5f3e-3b7a-4f4e-9d3a-2a6f5b9f1c11',
  deviceId: '4f1c2d3e-5a6b-4c7d-8e9f-0a1b2c3d4e5f',
  name: 'Мама',
  hasPasskey: false,
};

describe('rememberedAccount', () => {
  beforeEach(() => {
    const items = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => items.get(key) ?? null,
      setItem: (key: string, value: string) => void items.set(key, value),
      removeItem: (key: string) => void items.delete(key),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('keeps the last account so the app opens without a connection', () => {
    expect(rememberedAccount()).toBeNull();
    rememberAccount(me);
    expect(rememberedAccount()).toEqual(me);
    forgetAccount();
    expect(rememberedAccount()).toBeNull();
  });

  it('ignores a damaged record', () => {
    localStorage.setItem(ACCOUNT_STORAGE_KEY, '{"userId":1');
    expect(rememberedAccount()).toBeNull();
    localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify({ ...me, familyId: 'nope' }));
    expect(rememberedAccount()).toBeNull();
  });
});
