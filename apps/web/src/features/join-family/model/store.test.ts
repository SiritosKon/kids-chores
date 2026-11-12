import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { INVITE_TOKEN_STORAGE_KEY } from '../lib/constants';
import { usePendingInviteStore } from './store';

const TOKEN = 'a'.repeat(43);

describe('usePendingInviteStore', () => {
  let items: Map<string, string>;

  beforeEach(() => {
    items = new Map();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => items.get(key) ?? null,
      setItem: (key: string, value: string) => void items.set(key, value),
      removeItem: (key: string) => void items.delete(key),
    });
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('keeps only a token that looks like ours, across a reload', () => {
    const invite = usePendingInviteStore();
    invite.remember('not-a-token');
    expect(invite.token).toBeNull();
    invite.remember(TOKEN);
    expect(items.get(INVITE_TOKEN_STORAGE_KEY)).toBe(TOKEN);
    setActivePinia(createPinia());
    expect(usePendingInviteStore().token).toBe(TOKEN);
  });

  it('shows who invited and forgets the link once it is accepted', async () => {
    const fetch = vi.fn((input: string) =>
      Promise.resolve(
        input.endsWith('/preview')
          ? Response.json({ inviterName: 'Мама', expiresAt: '2026-11-19T10:00:00.000Z', sameFamily: false })
          : new Response(null, { status: 204 })
      )
    );
    vi.stubGlobal('fetch', fetch);
    const invite = usePendingInviteStore();
    invite.remember(TOKEN);
    await invite.load();
    expect(invite.state).toBe('ready');
    expect(invite.preview?.inviterName).toBe('Мама');
    expect(await invite.accept()).toBe(true);
    expect(fetch).toHaveBeenLastCalledWith('/v1/family/invites/accept', expect.objectContaining({ body: JSON.stringify({ token: TOKEN }) }));
    expect(invite.token).toBeNull();
    expect(items.has(INVITE_TOKEN_STORAGE_KEY)).toBe(false);
  });

  it('tells a used or expired link apart from a missing connection', async () => {
    const invite = usePendingInviteStore();
    invite.remember(TOKEN);
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new TypeError('offline'))));
    await invite.load();
    expect(invite.state).toBe('failed');
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response(null, { status: 404 }))));
    await invite.load();
    expect(invite.state).toBe('gone');
    expect(invite.token).toBe(TOKEN);
  });
});
