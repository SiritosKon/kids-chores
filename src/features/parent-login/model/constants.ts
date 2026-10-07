import type { ResetStep } from './types';

export const RESET_STEP_TITLES: Readonly<Record<ResetStep, string>> = {
  check: 'Проверка для взрослых',
  next: 'Придумайте новый PIN',
  repeat: 'Повторите новый PIN',
};
