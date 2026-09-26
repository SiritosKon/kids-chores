import type { PinStep } from './types';

export const PIN_STEP_TITLES: Readonly<Record<PinStep, string>> = {
  current: 'Введите текущий PIN',
  next: 'Придумайте новый PIN',
  repeat: 'Повторите новый PIN',
};
