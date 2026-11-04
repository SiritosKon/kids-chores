import { SYNC_SCHEMA_VERSION, type SyncFields, type SyncKind, type SyncMutation } from '@kids-chores/contracts';
import { changedFields, changeTime, syncedFields } from '../lib/fields';
import { SYNC_SPECS } from './constants';
import { queueTable, readShadows, shadowKey, shadowTable } from './storage';
import type { ShadowRow, SyncSpec } from './types';

const mutation = (
  kind: SyncKind,
  id: string,
  op: SyncMutation['op'],
  fields: SyncFields,
  changedAt: number
): SyncMutation => ({
  mutationId: crypto.randomUUID(),
  schemaVersion: SYNC_SCHEMA_VERSION,
  kind,
  id,
  op,
  fields,
  changedAt,
});

const captureKind = async (spec: SyncSpec, now: number): Promise<number> => {
  const [rows, shadows] = await Promise.all([spec.read(), readShadows(spec.kind)]);
  const shadowById = new Map(shadows.map((shadow) => [shadow.id, shadow]));
  const mutations: SyncMutation[] = [];
  const nextShadows: ShadowRow[] = [];

  for (const row of rows) {
    const fields = syncedFields(row, spec.localFields);
    const shadow = shadowById.get(row.id);
    shadowById.delete(row.id);
    const changes = changedFields(shadow?.fields, fields);
    if (shadow && Object.keys(changes).length === 0) {
      continue;
    }
    mutations.push(mutation(spec.kind, row.id, 'put', changes, changeTime(row, spec.timeFields, now)));
    nextShadows.push({ key: shadowKey(spec.kind, row.id), kind: spec.kind, id: row.id, fields });
  }

  const gone = [...shadowById.values()];
  mutations.push(...gone.map((shadow) => mutation(spec.kind, shadow.id, 'delete', {}, now)));

  await queueTable.bulkAdd(mutations.map((item) => ({ mutation: item })));
  await shadowTable.bulkPut(nextShadows);
  await shadowTable.bulkDelete(gone.map((shadow) => shadow.key));
  return mutations.length;
};

export const captureChanges = async (now: number = Date.now()): Promise<number> => {
  let queued = 0;
  for (const spec of Object.values(SYNC_SPECS)) {
    queued += await captureKind(spec, now);
  }
  return queued;
};
