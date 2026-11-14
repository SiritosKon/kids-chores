import type { MailLocale, SetPinRequest } from '@kids-chores/contracts';
import { apiRequest } from '@/shared/api/http';
import type { PinCodeCheckResult, PinCodeSendResult, PinConfirmResult, PinSaveResult } from '../model/types';

export const confirmPin = async (pin: string): Promise<PinConfirmResult> => {
  const response = await apiRequest('/pin/check', 'POST', { pin });
  if (!response) {
    return 'offline';
  }
  if (response.status === 403) {
    return 'wrong';
  }
  if (response.status === 429) {
    return 'tooMany';
  }
  return response.ok ? 'ok' : 'failed';
};

export const savePin = async (body: SetPinRequest): Promise<PinSaveResult> => {
  const response = await apiRequest('/pin', 'PUT', body);
  if (!response) {
    return 'offline';
  }
  if (response.status === 403) {
    return 'denied';
  }
  return response.ok ? 'ok' : 'failed';
};

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
