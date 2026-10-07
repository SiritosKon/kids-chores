import type { RewardVisibility } from '../model/types';

export const REWARD_VISIBILITY_LABELS: Readonly<Record<RewardVisibility, string>> = {
  shop: 'В магазине за баллы',
  streak: 'Только приз за серию',
  hidden: 'Скрыта — сюрприз',
  goal: 'Только цель',
};

export const GOAL_VISIBILITIES: readonly RewardVisibility[] = ['shop', 'goal'];

export const PRIZE_VISIBILITIES: readonly RewardVisibility[] = ['shop', 'streak', 'hidden'];
