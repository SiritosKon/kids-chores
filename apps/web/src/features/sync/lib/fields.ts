import { syncFieldsSchema, type SyncFields } from '@kids-chores/contracts';
import type { SyncRow } from '../model/types';

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const byKey = ([a]: [string, unknown], [b]: [string, unknown]): number => (a < b ? -1 : a > b ? 1 : 0);

export const stableJson = (value: unknown): string =>
  JSON.stringify(value, (_key, inner: unknown) =>
    isPlainObject(inner) ? Object.fromEntries(Object.entries(inner).sort(byKey)) : inner
  );

export const syncedFields = (row: SyncRow, localFields: readonly string[]): SyncFields =>
  syncFieldsSchema.parse(
    JSON.parse(
      JSON.stringify(
        Object.fromEntries(Object.entries(row).filter(([field]) => field !== 'id' && !localFields.includes(field)))
      )
    )
  );

export const localPart = (row: Record<string, unknown>, localFields: readonly string[]): Record<string, unknown> =>
  Object.fromEntries(Object.entries(row).filter(([field]) => localFields.includes(field)));

export const sharedPart = (fields: SyncFields, localFields: readonly string[]): SyncFields =>
  Object.fromEntries(Object.entries(fields).filter(([field]) => !localFields.includes(field)));

export const changedFields = (before: SyncFields | undefined, after: SyncFields): SyncFields =>
  Object.fromEntries([
    ...Object.entries(after).filter(
      ([field, value]) => before === undefined || !(field in before) || stableJson(before[field]) !== stableJson(value)
    ),
    ...Object.keys(before ?? {})
      .filter((field) => !(field in after))
      .map((field) => [field, null]),
  ]);

export const changeTime = (row: SyncRow, timeFields: readonly string[], now: number): number => {
  const times = timeFields.map((field) => row[field]).filter((value): value is number => typeof value === 'number');
  return times.length > 0 ? Math.max(...times) : now;
};

export const touchesTables = (parts: Record<string, unknown>, tables: readonly string[]): boolean =>
  Object.keys(parts).some((part) => tables.some((name) => part.includes(`/${name}/`)));
