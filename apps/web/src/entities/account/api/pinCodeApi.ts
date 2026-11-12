import type { MailLocale } from '@kids-chores/contracts';
import { apiRequest } from '@/shared/api/http';
import type { PinCodeCheckResult, PinCodeSendResult } from '../model/types';

export const requestPinCode = async (email: string, locale: MailLocale): Promise<PinCodeSendResult> => {
  const response = await apiRequest('/pin/code', 'POST', { email, locale });
  if (!response) {
    return 'offline';
  }
  if (response.status === 422) {
    return 'mismatch';
  }
  if (response.status === 429) {
    return 'tooMany';
  }
  return response.ok ? 'sent' : 'failed';
};

export const checkPinCode = async (code: string): Promise<PinCodeCheckResult> => {
  const response = await apiRequest('/pin/code/check', 'POST', { code });
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
