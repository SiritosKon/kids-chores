import type { StageDraft } from './types';

export const STREAK_MIN_DAYS = 2;

export const EMPTY_STAGE_DRAFT: StageDraft = {
  days: 7,
  points: 0,
  rewardId: null,
  forEveryone: true,
  childIds: [],
};
