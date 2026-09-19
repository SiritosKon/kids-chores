import { transaction } from '@/shared/api/db';
import { withCatalogueDefaults, type CatalogueRow } from '@/shared/api/catalogue';
import { childrenCatalogue, DEFAULT_CHILDREN } from '@/entities/child';
import { tasksCatalogue, DEFAULT_TASKS } from '@/entities/task';
import { rewardsCatalogue, DEFAULT_REWARDS } from '@/entities/reward';
import {
  settingsTable,
  getSettings,
  saveSettings,
  DEFAULT_SETTINGS,
  SETTINGS_SEED_VERSION,
} from '@/entities/settings';
import { recalculateStreaks } from '@/features/track-streak';

interface SeededCatalogue<Row extends CatalogueRow> {
  table: { toArray: () => Promise<Row[]> };
  putMany: (items: Row[]) => Promise<void>;
}

const seedDefaults = async <Seed extends { id: string }, Row extends CatalogueRow>(
  catalogue: SeededCatalogue<Row>,
  defaults: readonly Seed[]
): Promise<void> => {
  const stored = (await catalogue.table.toArray()) as unknown as Record<string, unknown>[];
  const byId = new Map(stored.map((row) => [String(row.id), row]));

  const missing = defaults.filter((seed) => !byId.has(seed.id));
  const added = withCatalogueDefaults(missing).map((row, index) => ({
    ...row,
    order: stored.length + index,
  }));

  const patched: Record<string, unknown>[] = [];
  for (const seed of defaults) {
    const row = byId.get(seed.id);
    if (!row) {
      continue;
    }
    const patch = Object.entries(seed).filter(([key]) => row[key] === undefined);
    if (patch.length > 0) {
      patched.push({ ...row, ...Object.fromEntries(patch) });
    }
  }

  const rows = [...added, ...patched] as unknown as Row[];
  if (rows.length > 0) {
    await catalogue.putMany(rows);
  }
};

const seedSettings = async (): Promise<void> => {
  const stored = await getSettings();
  if (!stored) {
    await saveSettings(DEFAULT_SETTINGS);
    return;
  }
  if (stored.seedVersion < SETTINGS_SEED_VERSION) {
    await saveSettings({ ...DEFAULT_SETTINGS, parentPin: stored.parentPin });
  }
};

export const bootstrap = async (): Promise<void> => {
  await transaction(
    [childrenCatalogue.table, tasksCatalogue.table, rewardsCatalogue.table, settingsTable],
    async () => {
      await seedDefaults(childrenCatalogue, DEFAULT_CHILDREN);
      await seedDefaults(tasksCatalogue, DEFAULT_TASKS);
      await seedDefaults(rewardsCatalogue, DEFAULT_REWARDS);
      await seedSettings();
    }
  );

  await recalculateStreaks();
};
