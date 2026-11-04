import { z } from 'zod';
import { syncFieldsSchema } from '@kids-chores/contracts';

export const fieldChangedAtSchema = z.record(z.string(), z.number().int());

export const storedRecordSchema = z.object({
  data: syncFieldsSchema,
  fieldChangedAt: fieldChangedAtSchema,
  deleted: z.boolean(),
});
