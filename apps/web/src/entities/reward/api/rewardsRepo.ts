import { createCatalogue } from '@/shared/api/catalogue';
import { newIdentity } from '@/shared/api/ids';
import type { RowIdentity } from '@/shared/api/types';
import { rewardSchema } from '../model/schema';
import type { Reward } from '../model/types';
import { isSoldInShop } from '../lib/visibility';
import type { RewardDraft } from './types';

export const rewardsCatalogue = createCatalogue<Reward>('rewards', (rows) =>
  rewardSchema.array().parse(rows)
);

export const createReward = async (draft: RewardDraft, { id, at }: RowIdentity = newIdentity()): Promise<Reward> => {
  const reward: Reward = {
    ...draft,
    purchasable: isSoldInShop(draft.visibility),
    id,
    order: await rewardsCatalogue.nextOrder(),
    active: true,
    createdAt: at,
    updatedAt: at,
  };
  await rewardsCatalogue.put(reward);
  return reward;
};

export const updateReward = (rewardId: string, draft: RewardDraft): Promise<void> =>
  rewardsCatalogue.update(rewardId, { ...draft, purchasable: isSoldInShop(draft.visibility) });

export const archiveReward = (rewardId: string): Promise<void> => rewardsCatalogue.archive(rewardId);
