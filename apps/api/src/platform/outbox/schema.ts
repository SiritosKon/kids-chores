import { z } from 'zod';

export const outboxRowSchema = z.object({
  id: z.uuid(),
  type: z.string().min(1),
  version: z.number().int().positive(),
  family_id: z.uuid().nullable(),
  payload: z.record(z.string(), z.unknown()),
  occurred_at: z.date(),
});
