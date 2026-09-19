import { transaction } from '@/shared/api/db';
import { withCatalogueDefaults } from '@/shared/api/catalogue';
import { childrenCatalogue, DEFAULT_CHILDREN } from '@/entities/child';
import { tasksCatalogue, DEFAULT_TASKS } from '@/entities/task';
import { rewardsCatalogue, DEFAULT_REWARDS } from '@/entities/reward';
import { settingsTable, getSettings, saveSettings, DEFAULT_SETTINGS } from '@/entities/settings';
import { recalculateStreaks } from '@/features/track-streak';

export const bootstrap = async (): Promise<void> => {
  await transaction(
    [childrenCatalogue.table, tasksCatalogue.table, rewardsCatalogue.table, settingsTable],
    async () => {
      if ((await childrenCatalogue.count()) === 0) {
        await childrenCatalogue.putMany(withCatalogueDefaults(DEFAULT_CHILDREN));
      }
      if ((await tasksCatalogue.count()) === 0) {
        await tasksCatalogue.putMany(withCatalogueDefaults(DEFAULT_TASKS));
      }
      if ((await rewardsCatalogue.count()) === 0) {
        await rewardsCatalogue.putMany(withCatalogueDefaults(DEFAULT_REWARDS));
      }
      if (!(await getSettings())) {
        await saveSettings(DEFAULT_SETTINGS);
      }
    }
  );

  await recalculateStreaks();
};
