import { z } from 'zod';
import { AUTH_PROVIDERS } from '@kids-chores/contracts';

const base64url = z.string().regex(/^[A-Za-z0-9_-]+$/);

const transports = z.array(z.enum(['ble', 'cable', 'hybrid', 'internal', 'nfc', 'smart-card', 'usb']));

const clientExtensionResults = z.object({
  appid: z.boolean().optional(),
  credProps: z.object({ rk: z.boolean().optional() }).optional(),
  hmacCreateSecret: z.boolean().optional(),
});

export const authStateSchema = z.object({
  provider: z.enum(AUTH_PROVIDERS),
  verifier: z.string().min(43),
});

export const registrationResponseSchema = z.object({
  id: base64url,
  rawId: base64url,
  type: z.literal('public-key'),
  authenticatorAttachment: z.enum(['cross-platform', 'platform']).optional(),
  clientExtensionResults,
  response: z.object({
    clientDataJSON: base64url,
    attestationObject: base64url,
    authenticatorData: base64url.optional(),
    transports: transports.optional(),
    publicKeyAlgorithm: z.number().int().optional(),
    publicKey: base64url.optional(),
  }),
});

export const authenticationResponseSchema = z.object({
  id: base64url,
  rawId: base64url,
  type: z.literal('public-key'),
  authenticatorAttachment: z.enum(['cross-platform', 'platform']).optional(),
  clientExtensionResults,
  response: z.object({
    clientDataJSON: base64url,
    authenticatorData: base64url,
    signature: base64url,
    userHandle: base64url.optional(),
  }),
});

export const passkeyRegisterSchema = z.object({ response: registrationResponseSchema });

export const passkeyLoginSchema = z.object({ flowId: z.uuid(), response: authenticationResponseSchema });

export const passkeyTransportsSchema = transports;

export const googleProfileSchema = z.object({
  given_name: z.string().optional(),
  name: z.string().optional(),
  picture: z.string().optional(),
});
