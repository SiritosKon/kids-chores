import { apiRequest } from '@/shared/api/http';
import type { PasswordSaveResult, PasswordSignInResult } from '../model/types';

export const passwordSignIn = async (email: string, password: string): Promise<PasswordSignInResult> => {
  const response = await apiRequest('/auth/password', 'POST', { email, password });
  if (!response) {
    return 'offline';
  }
  if (response.status === 401) {
    return 'wrong';
  }
  if (response.status === 429) {
    return 'tooMany';
  }
  return response.ok ? 'ok' : 'failed';
};

export const savePassword = async (password: string, current?: string): Promise<PasswordSaveResult> => {
  const response = await apiRequest('/me/password', 'PUT', { password, current });
  if (!response) {
    return 'offline';
  }
  if (response.status === 403) {
    return 'denied';
  }
  if (response.status === 409) {
    return 'noEmail';
  }
  if (response.status === 422) {
    return 'breached';
  }
  return response.ok ? 'ok' : 'failed';
};
