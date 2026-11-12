import type { z } from 'zod';
import type {
  contactRequestSchema,
  contactSchema,
  devLoginRequestSchema,
  familyInviteSchema,
  familyMemberSchema,
  familyResponseSchema,
  incomingInviteSchema,
  joinRequestSchema,
  meResponseSchema,
  metaResponseSchema,
  passkeyCreationOptionsSchema,
  passkeyLoginOptionsSchema,
} from './schema.js';

export type MetaResponse = z.infer<typeof metaResponseSchema>;

export type MeResponse = z.infer<typeof meResponseSchema>;

export type DevLoginRequest = z.infer<typeof devLoginRequestSchema>;

export type PasskeyCreationOptions = z.infer<typeof passkeyCreationOptionsSchema>;

export type PasskeyLoginOptions = z.infer<typeof passkeyLoginOptionsSchema>;

export type Contact = z.infer<typeof contactSchema>;

export type ContactRequest = z.infer<typeof contactRequestSchema>;

export type IncomingInvite = z.infer<typeof incomingInviteSchema>;

export type FamilyMember = z.infer<typeof familyMemberSchema>;

export type FamilyInvite = z.infer<typeof familyInviteSchema>;

export type JoinRequest = z.infer<typeof joinRequestSchema>;

export type FamilyResponse = z.infer<typeof familyResponseSchema>;
