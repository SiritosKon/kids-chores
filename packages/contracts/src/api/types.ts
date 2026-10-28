import type { z } from 'zod';
import type {
  devLoginRequestSchema,
  meResponseSchema,
  metaResponseSchema,
  passkeyCreationOptionsSchema,
  passkeyLoginOptionsSchema,
  profileUpdateRequestSchema,
} from './schema.js';

export type MetaResponse = z.infer<typeof metaResponseSchema>;

export type MeResponse = z.infer<typeof meResponseSchema>;

export type DevLoginRequest = z.infer<typeof devLoginRequestSchema>;

export type ProfileUpdateRequest = z.infer<typeof profileUpdateRequestSchema>;

export type PasskeyCreationOptions = z.infer<typeof passkeyCreationOptionsSchema>;

export type PasskeyLoginOptions = z.infer<typeof passkeyLoginOptionsSchema>;
