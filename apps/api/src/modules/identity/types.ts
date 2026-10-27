import type { PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/server';
import type { z } from 'zod';
import type { Session } from '@kids-chores/contracts';
import type { authStateSchema } from './schema';

export type AuthState = z.infer<typeof authStateSchema>;

export type SignedIn = Omit<Session, 'createdAt'>;

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
