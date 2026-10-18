import type { Reward, RewardVariant } from '../model/types';

export type RewardDraft = Pick<Reward, 'name' | 'icon' | 'points' | 'visibility'>;

export interface VariantDraft {
  id: string | null;
  name: string;
  photo: string;
}

export type VariantChoice = Pick<RewardVariant, 'id' | 'name'>;
