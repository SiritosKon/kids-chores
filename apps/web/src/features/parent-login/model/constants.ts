import type { PinCodeFailure, PinCodeReply, ResetStep } from './types';

export const RESET_STEP_TITLES: Readonly<Record<ResetStep, string>> = {
  email: 'parentLogin.emailStep',
  code: 'parentLogin.codeStep',
  next: 'parentLogin.nextStep',
  repeat: 'parentLogin.repeatStep',
};

export const PIN_CODE_STATUSES: Readonly<Record<number, PinCodeReply>> = {
  409: 'noEmail',
  410: 'expired',
  422: 'wrong',
  429: 'tooSoon',
};

export const EMAIL_FAILURES: Readonly<Record<PinCodeFailure, string>> = {
  wrong: 'parentLogin.wrongEmail',
  noEmail: 'parentLogin.noEmail',
  expired: 'parentLogin.mailFailed',
  tooSoon: 'parentLogin.tooSoon',
  offline: 'parentLogin.offline',
  failed: 'parentLogin.mailFailed',
};

export const CODE_FAILURES: Readonly<Record<PinCodeFailure, string>> = {
  wrong: 'parentLogin.wrongCode',
  noEmail: 'parentLogin.codeExpired',
  expired: 'parentLogin.codeExpired',
  tooSoon: 'parentLogin.tooSoon',
  offline: 'parentLogin.offline',
  failed: 'parentLogin.codeFailed',
};
