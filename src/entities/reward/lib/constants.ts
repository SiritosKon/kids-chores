import type { RewardVisibility } from '../model/types';

export const REWARD_VISIBILITY_LABELS: Readonly<Record<RewardVisibility, string>> = {
  shop: 'rewardEntity.visibility.shop',
  streak: 'rewardEntity.visibility.streak',
  hidden: 'rewardEntity.visibility.hidden',
  goal: 'rewardEntity.visibility.goal',
};

export const GOAL_VISIBILITIES: readonly RewardVisibility[] = ['shop', 'goal'];

export const PRIZE_VISIBILITIES: readonly RewardVisibility[] = ['shop', 'streak', 'hidden'];
