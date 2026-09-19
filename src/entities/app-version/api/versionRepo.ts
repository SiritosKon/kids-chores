import { table } from '@/shared/api/db';
import { versionLogEntrySchema, type VersionLogEntry } from '../model/schema';

export const versionLogTable = table<VersionLogEntry>('versionLog');

export interface VersionVisit {
  isNew: boolean;
  hadHistory: boolean;
}

export const getVersionLog = async (): Promise<VersionLogEntry[]> => {
  return versionLogEntrySchema.array().parse(await versionLogTable.orderBy('firstSeenAt').toArray());
};

export const recordVersion = async (version: string): Promise<VersionVisit> => {
  const existing = await versionLogTable.get(version);
  if (existing) {
    return { isNew: false, hadHistory: true };
  }
  const count = await versionLogTable.count();
  await versionLogTable.add({ version, firstSeenAt: Date.now() });
  return { isNew: true, hadHistory: count > 0 };
};
