import type { SyncRecord } from '@kids-chores/contracts';
import { isUntouchedPreset } from '@/shared/api/ids';
import { localPart, sharedPart, stableJson, syncedFields } from '../lib/fields';
import { SYNC_SPECS } from './constants';
import { queueTable, readQueue, shadowKey, shadowTable } from './storage';

const applyRecord = async (record: SyncRecord, key: string): Promise<boolean> => {
  const spec = SYNC_SPECS[record.kind];
  const local = await spec.get(record.id);
  if (record.deleted) {
    await spec.remove(record.id);
    await shadowTable.delete(key);
    return local !== undefined;
  }
  const stored = await spec.store({
    ...sharedPart(record.data, spec.localFields),
    ...localPart(local ?? spec.localDefaults(), spec.localFields),
    id: record.id,
  });
  if (!stored) {
    return false;
  }
  const fields = syncedFields(stored, spec.localFields);
  await shadowTable.put({ key, kind: record.kind, id: record.id, fields });
  return local === undefined || stableJson(syncedFields(local, spec.localFields)) !== stableJson(fields);
};

export const applyRecords = async (records: readonly SyncRecord[]): Promise<boolean> => {
  const pending = new Set((await readQueue()).map(({ mutation }) => shadowKey(mutation.kind, mutation.id)));
  let changed = false;
  for (const record of records) {
    const key = shadowKey(record.kind, record.id);
    if (!pending.has(key) && (await applyRecord(record, key))) {
      changed = true;
    }
  }
  return changed;
};

export const hasFamilyData = (records: readonly SyncRecord[]): boolean =>
  records.some((record) => !record.deleted && record.kind !== 'settings');

export const isPristine = async (): Promise<boolean> => {
  const specs = Object.values(SYNC_SPECS).filter((spec) => spec.kind !== 'settings');
  const rows = (await Promise.all(specs.map((spec) => spec.read()))).flat();
  return rows.every((row) => typeof row.updatedAt === 'number' && isUntouchedPreset({ id: row.id, updatedAt: row.updatedAt }));
};

export const adoptLocalRows = async (): Promise<void> => {
  for (const spec of Object.values(SYNC_SPECS)) {
    const known = new Set((await shadowTable.where('kind').equals(spec.kind).primaryKeys()).map(String));
    const rows = (await spec.read()).filter((row) => !known.has(shadowKey(spec.kind, row.id)));
    await shadowTable.bulkPut(
      rows.map((row) => ({ key: shadowKey(spec.kind, row.id), kind: spec.kind, id: row.id, fields: syncedFields(row, spec.localFields) }))
    );
  }
};

export const replaceWithFamily = async (records: readonly SyncRecord[]): Promise<boolean> => {
  for (const spec of Object.values(SYNC_SPECS)) {
    if (spec.kind !== 'settings') {
      await spec.clear();
    }
  }
  await queueTable.clear();
  await shadowTable.clear();
  await applyRecords(records);
  return true;
};
