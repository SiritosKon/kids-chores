import type { ChildFormDraft } from './types';

export const NEW_GOAL_REWARD_OPTION = '__new-goal-reward__';

export const EMPTY_CHILD_DRAFT: ChildFormDraft = {
  name: '',
  carColor: '',
  photo: '',
  goalRewardId: null,
  goalVariantId: null,
};
