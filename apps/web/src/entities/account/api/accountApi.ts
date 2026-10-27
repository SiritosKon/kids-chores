import {
  API_PREFIX,
  meResponseSchema,
  metaResponseSchema,
  passkeyCreationOptionsSchema,
  passkeyLoginOptionsSchema,
  type AuthProvider,
  type MeResponse,
  type PasskeyCreationOptions,
  type PasskeyLoginOptions,
} from '@kids-chores/contracts';
import type { AuthenticationResponseJSON, RegistrationResponseJSON } from '@simplewebauthn/browser';
import { apiJson, apiOk } from '@/shared/api/http';
import type { ServerAuth } from '../model/types';

export const fetchServerAuth = async (): Promise<ServerAuth | null> =>
  (await apiJson('/meta', (data) => metaResponseSchema.parse(data)))?.auth ?? null;

export const fetchMe = (): Promise<MeResponse | null> => apiJson('/me', (data) => meResponseSchema.parse(data));

export const requestRename = (name: string | null): Promise<MeResponse | null> =>
  apiJson('/me', (data) => meResponseSchema.parse(data), 'PATCH', { name });

export const requestSignOut = (): Promise<boolean> => apiOk('/auth/logout', 'POST');

export const devSignIn = (name: string): Promise<boolean> => apiOk('/dev/login', 'POST', { name });

export const providerStartUrl = (provider: AuthProvider): string => `${API_PREFIX}/auth/${provider}/start`;

export const fetchPasskeyCreationOptions = (): Promise<PasskeyCreationOptions | null> =>
  apiJson('/auth/passkey/register/options', (data) => passkeyCreationOptionsSchema.parse(data), 'POST');

export const savePasskey = (response: RegistrationResponseJSON): Promise<boolean> =>
  apiOk('/auth/passkey/register', 'POST', { response });

export const fetchPasskeyLoginOptions = (): Promise<PasskeyLoginOptions | null> =>
  apiJson('/auth/passkey/login/options', (data) => passkeyLoginOptionsSchema.parse(data), 'POST');

export const passkeyLogin = (flowId: string, response: AuthenticationResponseJSON): Promise<boolean> =>
  apiOk('/auth/passkey/login', 'POST', { flowId, response });

export const removePasskey = (id: string): Promise<boolean> =>
  apiOk(`/auth/passkey/${encodeURIComponent(id)}`, 'DELETE');
