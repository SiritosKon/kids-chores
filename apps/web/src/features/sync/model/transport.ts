import {
  FAMILY_HEADER,
  syncPullResponseSchema,
  syncPushResponseSchema,
  type SyncMutation,
  type SyncPullResponse,
  type SyncPushResponse,
} from '@kids-chores/contracts';
import { apiRequest } from '@/shared/api/http';
import type { Transported } from './types';

const send = async <T>(
  familyId: string,
  path: string,
  parse: (data: unknown) => T,
  method?: string,
  body?: unknown
): Promise<Transported<T>> => {
  const response = await apiRequest(path, method, body, { [FAMILY_HEADER]: familyId });
  if (!response) {
    return { ok: false, reason: 'offline' };
  }
  if (response.status === 401) {
    return { ok: false, reason: 'signedOut' };
  }
  if (response.status === 409) {
    return { ok: false, reason: 'moved' };
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

export const pushMutations = (
  familyId: string,
  mutations: readonly SyncMutation[]
): Promise<Transported<SyncPushResponse>> =>
  send(familyId, '/sync/push', (data) => syncPushResponseSchema.parse(data), 'POST', { mutations });

export const pullRecords = (familyId: string, since: number): Promise<Transported<SyncPullResponse>> =>
  send(familyId, `/sync/pull?since=${since}`, (data) => syncPullResponseSchema.parse(data));
