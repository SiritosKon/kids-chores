import Dexie, { type Table } from 'dexie';

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

// Dexie раздаёт таблицы динамически и типизировать их здесь нечем: строки
// описаны zod-схемами в entities, а shared про entities знать не должен.
// Единственное приведение типа живёт тут; выше по слоям таблицы уже типизированы.
export function table<Row, Key = string>(name: string): Table<Row, Key> {
  return db.table(name) as unknown as Table<Row, Key>;
}

// Атомарная запись поверх нескольких таблиц: таблицы приходят из entities,
// имена схемы наружу не утекают.
export function transaction<T>(tables: readonly Table[], work: () => Promise<T>): Promise<T> {
  return db.transaction('rw', tables, work);
}

export function isPersistenceAvailable(): boolean {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    return false;
  }
}
