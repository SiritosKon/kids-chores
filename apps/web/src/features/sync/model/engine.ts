import { SYNC_PUSH_LIMIT, type SyncRecord } from '@kids-chores/contracts';
import { adoptLocalRows, applyRecords, hasFamilyData, isPristine, replaceWithFamily } from './apply';
import { captureChanges } from './capture';
import { pullRecords, pushMutations } from './transport';
import { inSyncTransaction, queueTable, readQueue, readState, saveState, shadowTable } from './storage';
import type { SyncReport, Transported } from './types';

const pullEverything = async (): Promise<Transported<{ records: SyncRecord[]; cursor: number }>> => {
  const records: SyncRecord[] = [];
  let cursor = 0;
  for (;;) {
    const page = await pullRecords(cursor);
    if (!page.ok) {
      return page;
    }
    records.push(...page.value.records);
    cursor = page.value.lastChangeNumber;
    if (!page.value.more) {
      return { ok: true, value: { records, cursor } };
    }
  }
};

const attach = async (familyId: string, previous: string | null): Promise<Transported<boolean>> => {
  const switching = previous !== null;
  if (switching || (await isPristine())) {
    const family = await pullEverything();
    if (!family.ok) {
      return family;
    }
    if (switching || hasFamilyData(family.value.records)) {
      await inSyncTransaction(async () => {
        await replaceWithFamily(family.value.records);
        if (switching) {
          await adoptLocalRows();
        }
        await saveState({ familyId, cursor: family.value.cursor });
      });
      return { ok: true, value: true };
    }
  }
  await inSyncTransaction(async () => {
    await queueTable.clear();
    await shadowTable.clear();
    await saveState({ familyId, cursor: 0 });
  });
  return { ok: true, value: false };
};

const pushQueue = async (): Promise<Transported<number>> => {
  let rejected = 0;
  for (;;) {
    const batch = await readQueue(SYNC_PUSH_LIMIT);
    if (batch.length === 0) {
      return { ok: true, value: rejected };
    }
    const pushed = await pushMutations(batch.map(({ mutation }) => mutation));
    if (!pushed.ok) {
      return pushed;
    }
    await queueTable.bulkDelete(batch.flatMap(({ seq }) => (seq === undefined ? [] : [seq])));
    rejected += pushed.value.rejected.length;
  }
};

const pullChanges = async (): Promise<Transported<boolean>> => {
  let changed = false;
  for (;;) {
    const { cursor } = await readState();
    const page = await pullRecords(cursor);
    if (!page.ok) {
      return page;
    }
    const applied = await inSyncTransaction(async () => {
      await captureChanges();
      const state = await readState();
      await saveState({ familyId: state.familyId, cursor: page.value.lastChangeNumber });
      return applyRecords(page.value.records);
    });
    changed = changed || applied;
    if (!page.value.more) {
      return { ok: true, value: changed };
    }
  }
};

export const syncFamily = async (familyId: string): Promise<SyncReport> => {
  let changed = false;
  const previous = (await readState()).familyId;
  if (previous !== familyId) {
    const attached = await attach(familyId, previous);
    if (!attached.ok) {
      return { failure: attached.reason, changed, rejected: 0 };
    }
    changed = attached.value;
  }
  await inSyncTransaction(() => captureChanges());
  const pushed = await pushQueue();
  if (!pushed.ok) {
    return { failure: pushed.reason, changed, rejected: 0 };
  }
  const pulled = await pullChanges();
  if (!pulled.ok) {
    return { failure: pulled.reason, changed, rejected: pushed.value };
  }
  return { changed: changed || pulled.value, rejected: pushed.value };
};

export const pendingChanges = (): Promise<number> => queueTable.count();
