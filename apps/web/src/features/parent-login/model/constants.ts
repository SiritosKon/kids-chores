import type { AuthProvider } from '@kids-chores/contracts';
import type { ResetStep } from './types';

export const RESET_STEP_TITLES: Readonly<Record<ResetStep, string>> = {
  email: 'parentLogin.emailStep',
  code: 'parentLogin.codeStep',
  providers: 'parentLogin.providerStep',
  next: 'parentLogin.nextStep',
  repeat: 'parentLogin.repeatStep',
};

export const PROVIDER_LABELS: Readonly<Record<AuthProvider, string>> = {
  google: 'signIn.google',
  telegram: 'signIn.telegram',
};

export const PIN_RESET_QUERY = 'pinReset';
