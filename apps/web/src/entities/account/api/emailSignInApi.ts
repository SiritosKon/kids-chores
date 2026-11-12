import type { MailLocale } from '@kids-chores/contracts';
import { apiRequest } from '@/shared/api/http';
import type { PinCodeCheckResult, PinCodeSendResult } from '../model/types';

export const requestSignInCode = async (email: string, locale: MailLocale): Promise<PinCodeSendResult> => {
  const response = await apiRequest('/auth/email/start', 'POST', { email, locale });
  if (!response) {
    return 'offline';
  }
  if (response.status === 429) {
    return 'tooMany';
  }
  return response.ok ? 'sent' : 'failed';
};

export const verifySignInCode = async (email: string, code: string): Promise<PinCodeCheckResult> => {
  const response = await apiRequest('/auth/email/verify', 'POST', { email, code });
  if (!response) {
    return 'offline';
  }
  if (response.status === 422) {
    return 'wrong';
  }
  if (response.status === 410) {
    return 'gone';
  }
  return response.ok ? 'ok' : 'failed';
};
