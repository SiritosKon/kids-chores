import type { z } from 'zod';
import type { Locale } from '@/shared/i18n';
import type { versionLogEntrySchema } from './schema';

export type VersionLogEntry = z.infer<typeof versionLogEntrySchema>;

export type ChangelogNotes = Record<Locale, string[]>;

export interface ChangelogEntry {
  version: string;
  date: string;
  notes: ChangelogNotes;
}
