import type { z } from 'zod';
import type { versionLogEntrySchema } from './schema';

export type VersionLogEntry = z.infer<typeof versionLogEntrySchema>;

export interface ChangelogEntry {
  version: string;
  date: string;
  notes: string[];
}
