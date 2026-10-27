import type { z } from 'zod';
import type { fieldChangedAtSchema, storedRecordSchema } from './schema';

export type FieldChangedAt = z.infer<typeof fieldChangedAtSchema>;

export type StoredRecord = z.infer<typeof storedRecordSchema>;
