import type { SyncKind } from '@kids-chores/contracts';
import { i18n } from '@/shared/i18n';
import { childrenCatalogue, childSchema } from '@/entities/child';
import { tasksCatalogue, storedTaskSchema } from '@/entities/task';
import { rewardsCatalogue, rewardSchema, variantsCatalogue, rewardVariantSchema } from '@/entities/reward';
import { getSettings, settingsTable, storedSettingsSchema } from '@/entities/settings';
import { completionsTable, getAllCompletions, storedCompletionSchema } from '@/entities/completion';
import { spendsTable, getAllSpends, storedSpendSchema } from '@/entities/spend';
import { defineSpec } from '../lib/spec';
import type { SyncSpec, SyncState } from './types';

export const SYNC_STATE_KEY = 'state';

export const INITIAL_SYNC_STATE: SyncState = { key: SYNC_STATE_KEY, familyId: null, cursor: 0 };

export const CAPTURE_DELAY_MS = 300;

export const RETRY_DELAY_MS = 30_000;

export const SYNC_SPECS: Record<SyncKind, SyncSpec> = {
  children: defineSpec({
    kind: 'children',
    table: childrenCatalogue.table,
    schema: childSchema,
    read: childrenCatalogue.read,
    timeFields: ['updatedAt'],
    localFields: ['photo'],
    localDefaults: () => ({ photo: '' }),
  }),
  tasks: defineSpec({
    kind: 'tasks',
    table: tasksCatalogue.table,
    schema: storedTaskSchema,
    read: tasksCatalogue.read,
    timeFields: ['updatedAt'],
  }),
  rewards: defineSpec({
    kind: 'rewards',
    table: rewardsCatalogue.table,
    schema: rewardSchema,
    read: rewardsCatalogue.read,
    timeFields: ['updatedAt'],
  }),
  rewardVariants: defineSpec({
    kind: 'rewardVariants',
    table: variantsCatalogue.table,
    schema: rewardVariantSchema,
    read: variantsCatalogue.read,
    timeFields: ['updatedAt'],
  }),
  settings: defineSpec({
    kind: 'settings',
    table: settingsTable,
    schema: storedSettingsSchema,
    read: () => getSettings().then((settings) => (settings ? [settings] : [])),
    timeFields: [],
    localFields: ['parentPin', 'tourPending', 'locale'],
    localDefaults: () => ({ parentPin: null, tourPending: false, locale: i18n.global.locale.value }),
  }),
  completions: defineSpec({
    kind: 'completions',
    table: completionsTable,
    schema: storedCompletionSchema,
    read: getAllCompletions,
    timeFields: ['updatedAt'],
  }),
  spends: defineSpec({
    kind: 'spends',
    table: spendsTable,
    schema: storedSpendSchema,
    read: getAllSpends,
    timeFields: ['createdAt', 'chosenAt'],
  }),
};
