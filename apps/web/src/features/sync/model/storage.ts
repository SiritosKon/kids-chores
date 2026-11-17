import type { Table } from 'dexie';
import type { SyncKind } from '@kids-chores/contracts';
import { table, transaction } from '@/shared/api/db';
import { INITIAL_SYNC_STATE, SYNC_SPECS, SYNC_STATE_KEY } from './constants';
import { queuedMutationSchema, shadowRowSchema, syncStateSchema } from './schema';
import type { QueuedMutation, ShadowRow, SyncState } from './types';

export const queueTable = table<QueuedMutation, number>('syncQueue');

export const shadowTable = table<ShadowRow>('syncShadow');

export const stateTable = table<SyncState>('syncMeta');

export const shadowKey = (kind: SyncKind, id: string): string => `${kind}/${id}`;

export const readState = async (): Promise<SyncState> => {
  const row = await stateTable.get(SYNC_STATE_KEY);
  return row ? syncStateSchema.parse(row) : INITIAL_SYNC_STATE;
};

export const saveState = async (state: Omit<SyncState, 'key'>): Promise<void> => {
  await stateTable.put({ key: SYNC_STATE_KEY, ...state });
};

export const readQueue = async (limit?: number): Promise<QueuedMutation[]> => {
  const ordered = queueTable.orderBy('seq');
  return queuedMutationSchema.array().parse(await (limit === undefined ? ordered : ordered.limit(limit)).toArray());
};

export const readShadows = async (kind: SyncKind): Promise<ShadowRow[]> =>
  shadowRowSchema.array().parse(await shadowTable.where('kind').equals(kind).toArray());

const syncTables = (): Table[] => [
  ...Object.values(SYNC_SPECS).map((spec) => spec.table),
  queueTable,
  shadowTable,
  stateTable,
];

export const inSyncTransaction = <T>(work: () => Promise<T>): Promise<T> => transaction(syncTables(), work);
