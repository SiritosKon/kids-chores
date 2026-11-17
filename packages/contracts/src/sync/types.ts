import type { z } from 'zod';
import type {
  syncFieldsSchema,
  syncKindSchema,
  syncMutationSchema,
  syncPullQuerySchema,
  syncPullResponseSchema,
  syncPushRequestSchema,
  syncPushResponseSchema,
  syncRecordSchema,
} from './schema.js';

export type SyncKind = z.infer<typeof syncKindSchema>;

export type SyncFields = z.infer<typeof syncFieldsSchema>;

export type SyncMutation = z.infer<typeof syncMutationSchema>;

export type SyncPushRequest = z.infer<typeof syncPushRequestSchema>;

export type SyncPushResponse = z.infer<typeof syncPushResponseSchema>;

export type SyncPullQuery = z.infer<typeof syncPullQuerySchema>;

export type SyncRecord = z.infer<typeof syncRecordSchema>;

export type SyncPullResponse = z.infer<typeof syncPullResponseSchema>;
