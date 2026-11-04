import { i18n } from '@/shared/i18n';
import { GOAL_VISIBILITIES, REWARD_VISIBILITY_LABELS } from './constants';
import type { RewardVisibility } from '../model/types';

export const isSoldInShop = (visibility: RewardVisibility): boolean => visibility === 'shop';

export const canBeGoal = (visibility: RewardVisibility): boolean => GOAL_VISIBILITIES.includes(visibility);

export const minRewardPrice = (visibility: RewardVisibility): number => (visibility === 'streak' ? 0 : 1);

export const rewardPriceLabel = (points: number): string =>
  points > 0 ? i18n.global.t('common.pointsShort', points) : i18n.global.t('rewardEntity.noPrice');

export const rewardVisibilityLabel = (visibility: RewardVisibility): string =>
  i18n.global.t(REWARD_VISIBILITY_LABELS[visibility]);
