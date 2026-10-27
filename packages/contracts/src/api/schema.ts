import { z } from 'zod';
import { AUTH_PROVIDERS, REGIONS } from '../constants.js';

export const metaResponseSchema = z.object({
  version: z.string().min(1),
  minClientVersion: z.string().min(1),
  commit: z.string().min(1),
  region: z.enum(REGIONS),
  auth: z.object({
    providers: z.array(z.enum(AUTH_PROVIDERS)),
    devLogin: z.boolean(),
  }),
});

export const meResponseSchema = z.object({
  userId: z.uuid(),
  familyId: z.uuid(),
  deviceId: z.uuid(),
  hasPasskey: z.boolean(),
});

export const devLoginRequestSchema = z.object({
  name: z.string().trim().min(1).max(40),
});
