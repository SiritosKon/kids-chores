import type { PinStep, StageDraft } from './types';

export const PIN_STEP_TITLES: Readonly<Record<PinStep, string>> = {
  current: 'Введите текущий PIN',
  next: 'Придумайте новый PIN',
  repeat: 'Повторите новый PIN',
};

export const STREAK_MIN_DAYS = 2;

export const EMPTY_STAGE_DRAFT: StageDraft = {
  days: 7,
  points: 0,
  rewardId: null,
  forEveryone: true,
  childIds: [],
};
