import type { z } from 'zod';
import type { devLoginRequestSchema, meResponseSchema, metaResponseSchema } from './schema.js';

export type MetaResponse = z.infer<typeof metaResponseSchema>;

export type MeResponse = z.infer<typeof meResponseSchema>;

export type DevLoginRequest = z.infer<typeof devLoginRequestSchema>;
