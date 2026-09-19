import { table } from '@/shared/api/db';
import { versionLogEntrySchema, type VersionLogEntry } from '../model/schema';

export const versionLogTable = table<VersionLogEntry>('versionLog');

export interface VersionVisit {
  /** Версия впервые открыта на этом устройстве. */
  isNew: boolean;
  /** До неё устройство уже видело другие версии — значит это обновление, а не установка. */
  hadHistory: boolean;
}

export async function getVersionLog(): Promise<VersionLogEntry[]> {
  return versionLogEntrySchema.array().parse(await versionLogTable.orderBy('firstSeenAt').toArray());
}

export async function recordVersion(version: string): Promise<VersionVisit> {
  const existing = await versionLogTable.get(version);
  if (existing) {
    return { isNew: false, hadHistory: true };
  }
  const count = await versionLogTable.count();
  await versionLogTable.add({ version, firstSeenAt: Date.now() });
  return { isNew: true, hadHistory: count > 0 };
}
