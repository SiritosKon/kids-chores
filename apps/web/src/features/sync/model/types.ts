import type { Table } from 'dexie';
import type { z } from 'zod';
import type { SyncKind } from '@kids-chores/contracts';
import type { queuedMutationSchema, shadowRowSchema, syncStateSchema } from './schema';

export type SyncRow = { id: string } & Record<string, unknown>;

export type QueuedMutation = z.infer<typeof queuedMutationSchema>;

export type ShadowRow = z.infer<typeof shadowRowSchema>;

export type SyncState = z.infer<typeof syncStateSchema>;

export interface SpecSource<Row extends SyncRow> {
  kind: SyncKind;
  table: Table<Row, string>;
  schema: z.ZodType<Row>;
  read: () => Promise<Row[]>;
  timeFields: readonly string[];
  localFields?: readonly string[];
  localDefaults?: () => Record<string, unknown>;
}

export interface SyncSpec {
  kind: SyncKind;
  table: Table;
  timeFields: readonly string[];
  localFields: readonly string[];
  localDefaults: () => Record<string, unknown>;
  read: () => Promise<SyncRow[]>;
  get: (id: string) => Promise<SyncRow | undefined>;
  store: (row: Record<string, unknown>) => Promise<SyncRow | null>;
  remove: (id: string) => Promise<void>;
  clear: () => Promise<void>;
}

export type SyncFailure = 'offline' | 'signedOut' | 'failed';

export type SyncStatus = 'off' | 'syncing' | 'synced' | SyncFailure;

export type Transported<T> = { ok: true; value: T } | { ok: false; reason: SyncFailure };

export interface SyncReport {
  failure?: SyncFailure;
  changed: boolean;
  rejected: number;
}

export interface SyncHooks {
  afterRemoteChanges: () => Promise<unknown>;
}
