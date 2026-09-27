import type { PinStep } from './types';

export const PIN_STEP_TITLES: Readonly<Record<PinStep, string>> = {
  current: 'Введите текущий PIN',
  next: 'Придумайте новый PIN',
  repeat: 'Повторите новый PIN',
};

export const STREAK_MIN_DAYS = 2;

export const NEW_REWARD_OPTION = '__new-reward__';
