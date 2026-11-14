import { z } from 'zod';
import {
  ACCOUNT_NAME_MAX,
  AUTH_PROVIDERS,
  CONTACT_KINDS,
  EMAIL_CODE_PATTERN,
  EMAIL_MAX,
  INVITE_TOKEN_PATTERN,
  MAIL_LOCALES,
  MEMBER_ROLES,
  PHONE_PATTERN,
  PARENT_PIN_PATTERN,
  PHONE_SEPARATORS,
  PIN_HASH_ITERATIONS_MAX,
  PROVIDER_PICTURE_HOST,
  REGIONS,
} from '../constants.js';

export const metaResponseSchema = z.object({
  version: z.string().min(1),
  minClientVersion: z.string().min(1),
  commit: z.string().min(1),
  region: z.enum(REGIONS),
  auth: z.object({
    providers: z.array(z.enum(AUTH_PROVIDERS)),
    devLogin: z.boolean(),
    emailSignIn: z.boolean().default(false),
    contacts: z.array(z.enum(CONTACT_KINDS)).default([]),
  }),
});

export const accountNameSchema = z.string().trim().min(1).max(ACCOUNT_NAME_MAX);

export const memberRoleSchema = z.enum(MEMBER_ROLES);

export const emailSchema = z.string().trim().toLowerCase().pipe(z.email().max(EMAIL_MAX));

export const phoneSchema = z
  .string()
  .transform((value) => value.replace(PHONE_SEPARATORS, '').replace(/^00/, '+'))
  .pipe(z.string().regex(PHONE_PATTERN));

export const contactSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('email'), value: emailSchema }),
  z.object({ kind: z.literal('phone'), value: phoneSchema }),
]);

export const contactRequestSchema = z.object({ contact: contactSchema });

export const mailLocaleSchema = z.enum(MAIL_LOCALES);

export const createInviteRequestSchema = z.object({
  email: emailSchema.optional(),
  locale: mailLocaleSchema,
});

export const emailCodeRequestSchema = z.object({
  email: emailSchema,
  locale: mailLocaleSchema,
});

export const emailCodeCheckSchema = z.object({ code: z.string().regex(EMAIL_CODE_PATTERN) });

export const emailSignInSchema = z.object({
  email: emailSchema,
  code: z.string().regex(EMAIL_CODE_PATTERN),
});

export const updateMeRequestSchema = z.object({ name: accountNameSchema });

export const mediaCreatedSchema = z.object({ id: z.uuid() });

export const inviteTokenRequestSchema = z.object({ token: z.string().regex(INVITE_TOKEN_PATTERN) });

export const createdInviteSchema = z.object({
  id: z.uuid(),
  token: z.string().regex(INVITE_TOKEN_PATTERN),
  expiresAt: z.iso.datetime(),
});

export const invitePreviewSchema = z.object({
  inviterName: accountNameSchema.nullable(),
  expiresAt: z.iso.datetime(),
  sameFamily: z.boolean(),
});

export const pinHashSchema = z.object({
  salt: z.string().min(1).max(64),
  hash: z.string().min(1).max(128),
  iterations: z.number().int().positive().max(PIN_HASH_ITERATIONS_MAX),
});

export const memberPinSchema = z.object({ userId: z.uuid(), pin: pinHashSchema });

export const setPinRequestSchema = z.object({ pin: pinHashSchema, current: z.string().min(1).max(128).optional() });

export const pinCheckRequestSchema = z.object({ pin: z.string().regex(PARENT_PIN_PATTERN) });

export const meResponseSchema = z.object({
  userId: z.uuid(),
  familyId: z.uuid(),
  deviceId: z.uuid(),
  name: accountNameSchema.nullable(),
  hasPasskey: z.boolean(),
  role: memberRoleSchema.default('owner'),
  members: z.number().int().positive().default(1),
  hasEmail: z.boolean().default(false),
  joinRequests: z.number().int().nonnegative().default(0),
  providers: z.array(z.enum(AUTH_PROVIDERS)).default([]),
  pins: z.array(memberPinSchema).optional(),
});

export const familyMemberSchema = z.object({
  userId: z.uuid(),
  name: accountNameSchema.nullable(),
  role: memberRoleSchema,
  you: z.boolean(),
});

export const familyInviteSchema = z.object({
  id: z.uuid(),
  createdAt: z.iso.datetime(),
  expiresAt: z.iso.datetime(),
});

export const joinRequestSchema = z.object({
  id: z.uuid(),
  name: accountNameSchema.nullable(),
  createdAt: z.iso.datetime(),
});

export const familyResponseSchema = z.object({
  members: z.array(familyMemberSchema),
  invites: z.array(familyInviteSchema),
  requests: z.array(joinRequestSchema),
});

export const providerPictureSchema = z.url({ protocol: /^https$/, hostname: PROVIDER_PICTURE_HOST });

export const devLoginRequestSchema = z.object({
  name: z.string().trim().min(1).max(40),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
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
