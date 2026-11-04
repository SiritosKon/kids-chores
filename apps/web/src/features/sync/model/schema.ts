import { z } from 'zod';
import { syncFieldsSchema, syncKindSchema, syncMutationSchema } from '@kids-chores/contracts';
import { SYNC_STATE_KEY } from './constants';

export const queuedMutationSchema = z.object({
  seq: z.number().int().optional(),
  mutation: syncMutationSchema,
});

export const shadowRowSchema = z.object({
  key: z.string().min(1),
  kind: syncKindSchema,
  id: z.string().min(1),
  fields: syncFieldsSchema,
});

export const syncStateSchema = z.object({
  key: z.literal(SYNC_STATE_KEY),
  familyId: z.string().nullable(),
  cursor: z.number().int().nonnegative(),
});
