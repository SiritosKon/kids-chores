import type { PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/server';
import type { ServerMetadata } from 'openid-client';
import type { z } from 'zod';
import type { Contact, ContactKind, Session } from '@kids-chores/contracts';
import type { FamilyInvite } from '../../generated/prisma/client';
import type { authStateSchema } from './schema';

export type AuthState = z.infer<typeof authStateSchema>;

export type SignedIn = Omit<Session, 'createdAt'>;

export interface ProviderIdentity {
  subject: string;
  name?: string;
  picture?: string;
  contacts: Contact[];
}

export interface OidcProvider {
  server: ServerMetadata;
  scope: string;
  params: Record<string, string>;
}

export interface ProviderCredentials {
  clientId: string;
  clientSecret: string;
}

export interface ContactHash {
  kind: ContactKind;
  hash: string;
}

export interface EmailParts {
  local: string;
  domain: string;
}

export interface AccountProfile {
  name?: string;
  contacts: readonly ContactHash[];
}

export interface ProviderStart {
  url: string;
  state: string;
}

export type PasskeyRegisterOptions = PublicKeyCredentialCreationOptionsJSON;

export interface PasskeyLoginOptions {
  flowId: string;
  options: PublicKeyCredentialRequestOptionsJSON;
}

declare module 'fastify' {
  interface FastifyRequest {
    authSession?: Session;
    sessionToken?: string;
  }
}

export interface MailText {
  subject: string;
  paragraphs: readonly string[];
  someone: string;
}

export interface DailyLimit {
  name: string;
  perDay: number;
}

export interface RemovedUser {
  familyDropped: boolean;
}

export type InviteWithInviter = FamilyInvite & { inviter: { name: string | null } };
