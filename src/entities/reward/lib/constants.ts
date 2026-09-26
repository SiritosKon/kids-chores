import type { RewardVisibility } from '../model/types';

export const REWARD_VISIBILITY_LABELS: Readonly<Record<RewardVisibility, string>> = {
  shop: 'В магазине',
  streak: 'Только за серию',
  hidden: 'Скрыта от детей',
};
