import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ACCOUNT_STORAGE_KEY } from './constants';
import { forgetAccount, rememberAccount, rememberedAccount } from './rememberedAccount';

const me = {
  userId: '6a1e0d7c-5f0b-4c2e-8b8d-9f2e3c4d5a6b',
  familyId: '0b8b5f3e-3b7a-4f4e-9d3a-2a6f5b9f1c11',
  deviceId: '4f1c2d3e-5a6b-4c7d-8e9f-0a1b2c3d4e5f',
  name: 'Мама',
  hasPasskey: false,
  role: 'owner' as const,
  members: 2,
  hasEmail: true,
  hasPassword: false,
  joinRequests: 0,
  providers: ['google' as const],
  pins: [{ userId: '6a1e0d7c-5f0b-4c2e-8b8d-9f2e3c4d5a6b', pin: { salt: 'c2FsdA==', hash: 'aGFzaA==', iterations: 600_000 } }],
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

  it('reads an account remembered before families had several adults', () => {
    const older = { userId: me.userId, familyId: me.familyId, deviceId: me.deviceId, name: me.name, hasPasskey: false };
    localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(older));
    expect(rememberedAccount()).toEqual({ ...older, role: 'owner', members: 1, hasEmail: false, hasPassword: false, joinRequests: 0, providers: [] });
    expect(rememberedAccount()?.pins).toBeUndefined();
  });

  it('ignores a damaged record', () => {
    localStorage.setItem(ACCOUNT_STORAGE_KEY, '{"userId":1');
    expect(rememberedAccount()).toBeNull();
    localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify({ ...me, familyId: 'nope' }));
    expect(rememberedAccount()).toBeNull();
  });
});
