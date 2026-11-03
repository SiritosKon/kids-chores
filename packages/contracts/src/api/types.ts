import type { z } from 'zod';
import type {
  devLoginRequestSchema,
  meResponseSchema,
  metaResponseSchema,
  passkeyCreationOptionsSchema,
  passkeyLoginOptionsSchema,
  pinCodeCheckSchema,
  pinCodeRequestSchema,
} from './schema.js';

export type MetaResponse = z.infer<typeof metaResponseSchema>;

export type MeResponse = z.infer<typeof meResponseSchema>;

export type DevLoginRequest = z.infer<typeof devLoginRequestSchema>;

export type PasskeyCreationOptions = z.infer<typeof passkeyCreationOptionsSchema>;

export type PasskeyLoginOptions = z.infer<typeof passkeyLoginOptionsSchema>;

export type PinCodeRequest = z.infer<typeof pinCodeRequestSchema>;

export type PinCodeCheck = z.infer<typeof pinCodeCheckSchema>;
