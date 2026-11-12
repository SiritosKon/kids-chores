import type { ResetStep } from './types';

export const RESET_STEP_TITLES: Readonly<Record<ResetStep, string>> = {
  email: 'parentLogin.emailStep',
  code: 'parentLogin.codeStep',
  check: 'parentLogin.checkStep',
  next: 'parentLogin.nextStep',
  repeat: 'parentLogin.repeatStep',
};
