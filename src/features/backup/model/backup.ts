import { transaction } from '@/shared/api/db';
import { completionsTable, getAllCompletions } from '@/entities/completion';
import { spendsTable, getAllSpends } from '@/entities/spend';
import { backupSchema, describeIssues, BACKUP_VERSION, type Backup } from './schema';

export async function exportAll(): Promise<Backup> {
  const [completions, spends] = await Promise.all([getAllCompletions(), getAllSpends()]);
  return { version: BACKUP_VERSION, exportedAt: new Date().toISOString(), completions, spends };
}

export async function exportMonth(year: number, month: number): Promise<Backup> {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  const { completions, spends } = await exportAll();
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    completions: completions.filter((row) => row.date.startsWith(prefix)),
    spends: (spends ?? []).filter((spend) => {
      const day = new Date(spend.createdAt);
      return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}` === prefix;
    }),
  };
}

export async function importAll(data: unknown): Promise<void> {
  const parsed = backupSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(describeIssues(parsed.error));
  }
  const { completions, spends = [] } = parsed.data;

  await transaction([completionsTable, spendsTable], async () => {
    await completionsTable.clear();
    await completionsTable.bulkAdd(completions);
    await spendsTable.clear();
    if (spends.length > 0) {
      await spendsTable.bulkAdd(spends);
    }
  });
}
