import { GOAL_VISIBILITIES } from './constants';
import type { RewardVisibility } from '../model/types';

export const isSoldInShop = (visibility: RewardVisibility): boolean => visibility === 'shop';

export const canBeGoal = (visibility: RewardVisibility): boolean => GOAL_VISIBILITIES.includes(visibility);

export const minRewardPrice = (visibility: RewardVisibility): number => (visibility === 'streak' ? 0 : 1);

export const rewardPriceLabel = (points: number): string => (points > 0 ? `${points} б.` : 'без цены');
