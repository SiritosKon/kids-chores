import type { PinStep, StageDraft } from './types';

export const PIN_STEP_TITLES: Readonly<Record<PinStep, string>> = {
  current: 'editSettings.pinSteps.current',
  next: 'editSettings.pinSteps.next',
  repeat: 'editSettings.pinSteps.repeat',
};

export const STREAK_MIN_DAYS = 2;

export const EMPTY_STAGE_DRAFT: StageDraft = {
  days: 7,
  points: 0,
  rewardId: null,
  forEveryone: true,
  childIds: [],
};
