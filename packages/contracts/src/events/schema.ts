import { z } from 'zod';

export const eventEnvelopeSchema = z.object({
  eventId: z.uuid(),
  type: z.string().min(1),
  version: z.number().int().positive(),
  occurredAt: z.iso.datetime(),
  familyId: z.uuid().nullable(),
  payload: z.record(z.string(), z.unknown()),
});
