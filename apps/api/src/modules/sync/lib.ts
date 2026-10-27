import type { SyncFields, SyncMutation } from '@kids-chores/contracts';
import { DELETED_FIELD } from './constants';
import type { FieldChangedAt, StoredRecord } from './types';

const EMPTY_RECORD: StoredRecord = { data: {}, fieldChangedAt: {}, deleted: false };

const isFresh = (fieldChangedAt: FieldChangedAt, field: string, at: number): boolean =>
  (fieldChangedAt[field] ?? -1) <= at;

export const mergeRecord = (current: StoredRecord | null, mutation: SyncMutation, now: number): StoredRecord => {
  const previous = current ?? EMPTY_RECORD;
  const at = Math.min(mutation.changedAt, now);
  const fresh = mutation.op === 'put'
    ? Object.entries(mutation.fields).filter(([field]) => isFresh(previous.fieldChangedAt, field, at))
    : [];
  const freshNames = new Set(fresh.map(([field]) => field));
  const data: SyncFields = Object.fromEntries([
    ...Object.entries(previous.data).filter(([field]) => !freshNames.has(field)),
    ...fresh.filter(([, value]) => value !== null),
  ]);
  const deletedFresh = isFresh(previous.fieldChangedAt, DELETED_FIELD, at);
  return {
    data,
    fieldChangedAt: {
      ...previous.fieldChangedAt,
      ...Object.fromEntries(fresh.map(([field]) => [field, at])),
      ...(deletedFresh ? { [DELETED_FIELD]: at } : {}),
    },
    deleted: deletedFresh ? mutation.op === 'delete' : previous.deleted,
  };
};

export const deletedAt = (record: StoredRecord): Date | null => {
  const at = record.fieldChangedAt[DELETED_FIELD];
  return record.deleted && at !== undefined ? new Date(at) : null;
};
