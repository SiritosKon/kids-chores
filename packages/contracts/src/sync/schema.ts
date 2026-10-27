import { z } from 'zod';
import {
  SYNC_FIELD_PATTERN,
  SYNC_FIELDS_LIMIT,
  SYNC_KINDS,
  SYNC_PULL_LIMIT,
  SYNC_PUSH_LIMIT,
} from '../constants.js';

const changeNumber = z.number().int().nonnegative();

export const syncKindSchema = z.enum(SYNC_KINDS);

export const syncFieldsSchema = z
  .record(z.string().regex(SYNC_FIELD_PATTERN), z.json())
  .refine((fields) => Object.keys(fields).length <= SYNC_FIELDS_LIMIT);

export const syncMutationSchema = z.object({
  mutationId: z.uuid(),
  schemaVersion: z.number().int().positive(),
  kind: syncKindSchema,
  id: z.string().min(1).max(200),
  op: z.enum(['put', 'delete']),
  fields: syncFieldsSchema,
  changedAt: z.number().int().nonnegative(),
});

export const syncPushRequestSchema = z.object({
  mutations: z.array(syncMutationSchema).min(1).max(SYNC_PUSH_LIMIT),
});

export const syncPushResponseSchema = z.object({
  applied: z.number().int().nonnegative(),
  rejected: z.array(z.uuid()),
  lastChangeNumber: changeNumber,
});

export const syncPullQuerySchema = z.object({
  since: z.coerce.number().int().nonnegative().default(0),
  limit: z.coerce.number().int().positive().max(SYNC_PULL_LIMIT).default(SYNC_PULL_LIMIT),
});

export const syncRecordSchema = z.object({
  kind: syncKindSchema,
  id: z.string().min(1),
  data: syncFieldsSchema,
  deleted: z.boolean(),
  changeNumber,
});

export const syncPullResponseSchema = z.object({
  records: z.array(syncRecordSchema),
  lastChangeNumber: changeNumber,
  more: z.boolean(),
});
