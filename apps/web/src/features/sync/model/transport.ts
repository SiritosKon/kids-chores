import {
  syncPullResponseSchema,
  syncPushResponseSchema,
  type SyncMutation,
  type SyncPullResponse,
  type SyncPushResponse,
} from '@kids-chores/contracts';
import { apiRequest } from '@/shared/api/http';
import type { Transported } from './types';

const send = async <T>(
  path: string,
  parse: (data: unknown) => T,
  method?: string,
  body?: unknown
): Promise<Transported<T>> => {
  const response = await apiRequest(path, method, body);
  if (!response) {
    return { ok: false, reason: 'offline' };
  }
  if (response.status === 401) {
    return { ok: false, reason: 'signedOut' };
  }
  if (!response.ok) {
    return { ok: false, reason: 'failed' };
  }
  try {
    return { ok: true, value: parse(await response.json()) };
  } catch {
    return { ok: false, reason: 'failed' };
  }
};

export const pushMutations = (mutations: readonly SyncMutation[]): Promise<Transported<SyncPushResponse>> =>
  send('/sync/push', (data) => syncPushResponseSchema.parse(data), 'POST', { mutations });

export const pullRecords = (since: number): Promise<Transported<SyncPullResponse>> =>
  send(`/sync/pull?since=${since}`, (data) => syncPullResponseSchema.parse(data));
