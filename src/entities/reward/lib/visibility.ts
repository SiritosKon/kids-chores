import type { RewardVisibility } from '../model/types';

export const isSoldInShop = (visibility: RewardVisibility): boolean => visibility === 'shop';
