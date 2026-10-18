import type { z } from 'zod';
import type { eventEnvelopeSchema } from './schema.js';

export type EventEnvelope = z.infer<typeof eventEnvelopeSchema>;
