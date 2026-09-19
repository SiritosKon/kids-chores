import { transaction } from '@/shared/api/db';
import { completionsTable, getAllCompletions } from '@/entities/completion';
import { spendsTable, getAllSpends } from '@/entities/spend';
import { childrenCatalogue } from '@/entities/child';
import { tasksCatalogue } from '@/entities/task';
import { rewardsCatalogue } from '@/entities/reward';
import { settingsTable, getSettings, saveSettings } from '@/entities/settings';
import { backupSchema, describeIssues, BACKUP_VERSION, type Backup } from './schema';

const TABLES = [
  completionsTable,
  spendsTable,
  childrenCatalogue.table,
  tasksCatalogue.table,
  rewardsCatalogue.table,
  settingsTable,
];

export const exportAll = async (): Promise<Backup> => {
  const [completions, spends, children, tasks, rewards, settings] = await Promise.all([
    getAllCompletions(),
    getAllSpends(),
    childrenCatalogue.read(),
    tasksCatalogue.read(),
    rewardsCatalogue.read(),
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
    ...(settings ? { settings } : {}),
  };
};

export const importAll = async (data: unknown): Promise<void> => {
  const parsed = backupSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(describeIssues(parsed.error));
  }
  const { completions, spends = [], children, tasks, rewards, settings } = parsed.data;

  await transaction(TABLES, async () => {
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
    if (settings) {
      await saveSettings(settings);
    }
  });
};
