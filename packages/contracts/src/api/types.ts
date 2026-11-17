import type { z } from 'zod';
import type {
  contactRequestSchema,
  contactSchema,
  devLoginRequestSchema,
  familyInviteSchema,
  familyMemberSchema,
  familyResponseSchema,
  createInviteRequestSchema,
  emailCodeCheckSchema,
  emailCodeRequestSchema,
  emailSignInSchema,
  updateMeRequestSchema,
  pinHashSchema,
  memberPinSchema,
  setPinRequestSchema,
  pinCheckRequestSchema,
  passwordSignInSchema,
  setPasswordRequestSchema,
  createdInviteSchema,
  mediaCreatedSchema,
  invitePreviewSchema,
  inviteTokenRequestSchema,
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

export type CreateInviteRequest = z.infer<typeof createInviteRequestSchema>;

export type EmailCodeRequest = z.infer<typeof emailCodeRequestSchema>;

export type EmailCodeCheck = z.infer<typeof emailCodeCheckSchema>;

export type EmailSignIn = z.infer<typeof emailSignInSchema>;

export type UpdateMeRequest = z.infer<typeof updateMeRequestSchema>;

export type PinHash = z.infer<typeof pinHashSchema>;

export type MemberPin = z.infer<typeof memberPinSchema>;

export type SetPinRequest = z.infer<typeof setPinRequestSchema>;

export type PinCheckRequest = z.infer<typeof pinCheckRequestSchema>;
export type PasswordSignIn = z.infer<typeof passwordSignInSchema>;

export type SetPasswordRequest = z.infer<typeof setPasswordRequestSchema>;

export type InviteTokenRequest = z.infer<typeof inviteTokenRequestSchema>;

export type CreatedInvite = z.infer<typeof createdInviteSchema>;

export type MediaCreated = z.infer<typeof mediaCreatedSchema>;

export type InvitePreview = z.infer<typeof invitePreviewSchema>;

export type FamilyMember = z.infer<typeof familyMemberSchema>;

export type FamilyInvite = z.infer<typeof familyInviteSchema>;

export type JoinRequest = z.infer<typeof joinRequestSchema>;

export type FamilyResponse = z.infer<typeof familyResponseSchema>;
