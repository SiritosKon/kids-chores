import type { MailLocale } from '@kids-chores/contracts';
import { apiRequest } from '@/shared/api/http';
import { PIN_CODE_STATUSES } from './constants';
import type { PinCodeReply } from './types';

const replyOf = (response: Response | null): PinCodeReply => {
  if (!response) {
    return 'offline';
  }
  return response.ok ? 'ok' : (PIN_CODE_STATUSES[response.status] ?? 'failed');
};

export const requestPinCode = async (email: string, locale: MailLocale): Promise<PinCodeReply> =>
  replyOf(await apiRequest('/pin/code', 'POST', { email, locale }));

export const checkPinCode = async (code: string): Promise<PinCodeReply> =>
  replyOf(await apiRequest('/pin/code/check', 'POST', { code }));
