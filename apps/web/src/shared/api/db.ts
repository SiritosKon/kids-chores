import Dexie, { type Table } from 'dexie';
import { completionId, isStreakAwardId } from './ids';
import { completionKeySchema } from './schema';

export const db = new Dexie('kids-chores');

db.version(1).stores({
  completions: 'id, childId, date, [childId+date], [childId+taskId+date]',
});

db.version(2).stores({
  completions: 'id, childId, date, [childId+date], [childId+taskId+date]',
  spends: 'id, childId, rewardId, createdAt',
});

db.version(3).stores({
  completions: 'id, childId, date, [childId+date], [childId+taskId+date]',
  spends: 'id, childId, rewardId, createdAt',
  versionLog: 'version, firstSeenAt',
});

db.version(4).stores({
  completions: 'id, childId, date, [childId+date], [childId+taskId+date]',
  spends: 'id, childId, rewardId, createdAt, source',
  versionLog: 'version, firstSeenAt',
  children: 'id, order',
  tasks: 'id, order',
  rewards: 'id, order',
  settings: 'id',
  streaks: 'childId',
});

db.version(5).stores({
  completions: 'id, childId, date, [childId+date], [childId+taskId+date]',
  spends: 'id, childId, rewardId, createdAt, source',
  versionLog: 'version, firstSeenAt',
  children: 'id, order',
  tasks: 'id, order',
  rewards: 'id, order',
  rewardVariants: 'id, rewardId, order',
  variantPhotos: 'id',
  settings: 'id',
  streaks: 'childId',
});

db.version(6)
  .stores({
    completions: 'id, childId, date, [childId+date], [childId+taskId+date]',
    spends: 'id, childId, rewardId, createdAt, source',
    versionLog: 'version, firstSeenAt',
    children: 'id, order',
    tasks: 'id, order',
    rewards: 'id, order',
    rewardVariants: 'id, rewardId, order',
    variantPhotos: 'id',
    settings: 'id',
    streaks: 'childId',
    syncQueue: '++seq',
    syncShadow: 'key, kind',
    syncMeta: 'key',
  })
  .upgrade(async (tx) => {
    const completions = tx.table('completions');
    const rows = completionKeySchema.array().parse(await completions.toArray());
    const byId = new Map(
      rows.map((row) => {
        const id = isStreakAwardId(row.id) ? row.id : completionId(row.childId, row.taskId, row.date);
        const at = row.createdAt ?? (new Date(`${row.date}T12:00:00`).getTime() || 0);
        return [id, { ...row, id, createdAt: at, updatedAt: row.updatedAt ?? at }];
      })
    );
    await completions.clear();
    await completions.bulkAdd([...byId.values()]);
    const now = Date.now();
    await tx
      .table('spends')
      .toCollection()
      .modify((row: Record<string, unknown>) => {
        if (typeof row.createdAt !== 'number') {
          row.createdAt = now;
        }
      });
  });

// Dexie раздаёт таблицы динамически и типизировать их здесь нечем: строки
// описаны zod-схемами в entities, а shared про entities знать не должен.
// Единственное приведение типа живёт тут; выше по слоям таблицы уже типизированы.
export const table = <Row, Key = string>(name: string): Table<Row, Key> => {
  return db.table(name) as unknown as Table<Row, Key>;
};

// Атомарная запись поверх нескольких таблиц: таблицы приходят из entities,
// имена схемы наружу не утекают.
export const transaction = <T>(tables: readonly Table[], work: () => Promise<T>): Promise<T> => {
  return db.transaction('rw', tables, work);
};

export const isPersistenceAvailable = (): boolean => {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    return false;
  }
};
