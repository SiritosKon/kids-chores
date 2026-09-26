import type { Reward } from '../model/types';

export type RewardDraft = Pick<Reward, 'name' | 'icon' | 'points' | 'purchasable' | 'visibility'>;
