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

export function isPersistenceAvailable(): boolean {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    return false;
  }
}
