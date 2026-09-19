import { db } from '@/shared/api/db';

export function getVersionLog() {
  return db.versionLog.orderBy('firstSeenAt').toArray();
}

// Записывает версию в журнал устройства (если ещё не видели).
// Возвращает isNew (первый раз на этом устройстве) и hadHistory (была ли уже история).
export async function recordVersion(version) {
  const existing = await db.versionLog.get(version);
  if (existing) {
    return { isNew: false, hadHistory: true };
  }
  const count = await db.versionLog.count();
  await db.versionLog.add({ version, firstSeenAt: Date.now() });
  return { isNew: true, hadHistory: count > 0 };
}
