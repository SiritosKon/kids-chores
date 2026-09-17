import Dexie from 'dexie';

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

export function isPersistenceAvailable() {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    return false;
  }
}
