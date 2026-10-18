import { transaction } from '@/shared/api/db';
import { completionsTable, getAllCompletions } from '@/entities/completion';
import { spendsTable, getAllSpends } from '@/entities/spend';
import { childrenCatalogue } from '@/entities/child';
import { tasksCatalogue } from '@/entities/task';
import {
  rewardsCatalogue,
  variantsCatalogue,
  variantPhotosTable,
  getAllVariantPhotos,
} from '@/entities/reward';
import { getSettings, saveSettings } from '@/entities/settings';
import { backupSchema, describeIssues } from './schema';
import { BACKUP_VERSION, BACKUP_TABLES } from './constants';
import type { Backup } from './types';

export const exportAll = async (): Promise<Backup> => {
  const [completions, spends, children, tasks, rewards, rewardVariants, variantPhotos, settings] =
    await Promise.all([
      getAllCompletions(),
      getAllSpends(),
      childrenCatalogue.read(),
      tasksCatalogue.read(),
      rewardsCatalogue.read(),
      variantsCatalogue.read(),
      getAllVariantPhotos(),
      getSettings(),
    ]);

  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    completions,
    spends,
    children,
    tasks,
    rewards,
    rewardVariants,
    variantPhotos,
    ...(settings ? { settings } : {}),
  };
};

export const importAll = async (data: unknown): Promise<void> => {
  const parsed = backupSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(describeIssues(parsed.error));
  }
  const { completions, spends = [], children, tasks, rewards, rewardVariants, variantPhotos, settings } =
    parsed.data;

  await transaction(BACKUP_TABLES, async () => {
    await completionsTable.clear();
    await completionsTable.bulkAdd(completions);

    await spendsTable.clear();
    if (spends.length > 0) {
      await spendsTable.bulkAdd(spends);
    }

    if (children) {
      await childrenCatalogue.table.clear();
      await childrenCatalogue.putMany(children);
    }
    if (tasks) {
      await tasksCatalogue.table.clear();
      await tasksCatalogue.putMany(tasks);
    }
    if (rewards) {
      await rewardsCatalogue.table.clear();
      await rewardsCatalogue.putMany(rewards);
    }
    if (rewardVariants) {
      await variantsCatalogue.table.clear();
      await variantsCatalogue.putMany(rewardVariants);
    }
    if (variantPhotos) {
      await variantPhotosTable.clear();
      await variantPhotosTable.bulkPut(variantPhotos);
    }
    if (settings) {
      await saveSettings(settings);
    }
  });
};
