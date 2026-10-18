import type { z } from 'zod';
import type { metaResponseSchema } from './schema.js';

export type MetaResponse = z.infer<typeof metaResponseSchema>;
