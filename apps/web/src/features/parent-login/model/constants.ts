import type { ResetStep } from './types';

export const RESET_STEP_TITLES: Readonly<Record<ResetStep, string>> = {
  question: 'parentLogin.questionStep',
  check: 'parentLogin.checkStep',
  next: 'parentLogin.nextStep',
  repeat: 'parentLogin.repeatStep',
};
