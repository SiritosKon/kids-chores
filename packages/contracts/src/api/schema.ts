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

const passkeyTransports = z.array(z.enum(['ble', 'cable', 'hybrid', 'internal', 'nfc', 'smart-card', 'usb']));

const passkeyDescriptorSchema = z.object({
  id: z.string().min(1),
  type: z.literal('public-key'),
  transports: passkeyTransports.optional(),
});

const userVerification = z.enum(['discouraged', 'preferred', 'required']);

export const passkeyCreationOptionsSchema = z.object({
  rp: z.object({ id: z.string().optional(), name: z.string() }),
  user: z.object({ id: z.string(), name: z.string(), displayName: z.string() }),
  challenge: z.string().min(1),
  pubKeyCredParams: z.array(z.object({ alg: z.number().int(), type: z.literal('public-key') })),
  timeout: z.number().optional(),
  excludeCredentials: z.array(passkeyDescriptorSchema).optional(),
  authenticatorSelection: z
    .object({
      authenticatorAttachment: z.enum(['cross-platform', 'platform']).optional(),
      requireResidentKey: z.boolean().optional(),
      residentKey: userVerification.optional(),
      userVerification: userVerification.optional(),
    })
    .optional(),
  attestation: z.enum(['direct', 'enterprise', 'indirect', 'none']).optional(),
  extensions: z.object({ credProps: z.boolean().optional() }).optional(),
});

export const passkeyLoginOptionsSchema = z.object({
  flowId: z.uuid(),
  options: z.object({
    challenge: z.string().min(1),
    timeout: z.number().optional(),
    rpId: z.string().optional(),
    allowCredentials: z.array(passkeyDescriptorSchema).optional(),
    userVerification: userVerification.optional(),
  }),
});
