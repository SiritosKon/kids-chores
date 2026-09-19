import { transaction } from '@/shared/api/db';
import { withCatalogueDefaults } from '@/shared/api/catalogue';
import { childrenCatalogue, DEFAULT_CHILDREN } from '@/entities/child';
import { tasksCatalogue, DEFAULT_TASKS } from '@/entities/task';
import { rewardsCatalogue, DEFAULT_REWARDS } from '@/entities/reward';
import { settingsTable, getSettings, saveSettings, DEFAULT_SETTINGS } from '@/entities/settings';
import { recalculateStreaks } from '@/features/track-streak';

interface SeededCatalogue<Row> {
  existingIds: () => Promise<Set<string>>;
  count: () => Promise<number>;
  putMany: (items: Row[]) => Promise<void>;
}

const seedMissing = async <Seed extends { id: string }, Row>(
  catalogue: SeededCatalogue<Row>,
  defaults: readonly Seed[]
): Promise<void> => {
  const existing = await catalogue.existingIds();
  const missing = defaults.filter((seed) => !existing.has(seed.id));
  if (missing.length === 0) {
    return;
  }
  const offset = await catalogue.count();
  await catalogue.putMany(
    withCatalogueDefaults(missing).map((row, index) => ({ ...row, order: offset + index })) as Row[]
  );
};

export const bootstrap = async (): Promise<void> => {
  await transaction(
    [childrenCatalogue.table, tasksCatalogue.table, rewardsCatalogue.table, settingsTable],
    async () => {
      await seedMissing(childrenCatalogue, DEFAULT_CHILDREN);
      await seedMissing(tasksCatalogue, DEFAULT_TASKS);
      await seedMissing(rewardsCatalogue, DEFAULT_REWARDS);
      if (!(await getSettings())) {
        await saveSettings(DEFAULT_SETTINGS);
      }
    }
  );

  await recalculateStreaks();
};
