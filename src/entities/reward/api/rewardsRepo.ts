import { createCatalogue } from '@/shared/api/catalogue';
import { rewardSchema } from '../model/schema';
import type { Reward } from '../model/types';
import type { RewardDraft } from './types';

export const rewardsCatalogue = createCatalogue<Reward>('rewards', (rows) =>
  rewardSchema.array().parse(rows)
);

export const createReward = async (draft: RewardDraft): Promise<Reward> => {
  const now = Date.now();
  const reward: Reward = {
    ...draft,
    id: crypto.randomUUID(),
    order: await rewardsCatalogue.nextOrder(),
    active: true,
    createdAt: now,
    updatedAt: now,
  };
  await rewardsCatalogue.put(reward);
  return reward;
};

export const updateReward = (rewardId: string, draft: RewardDraft): Promise<void> =>
  rewardsCatalogue.update(rewardId, draft);

export const archiveReward = (rewardId: string): Promise<void> => rewardsCatalogue.archive(rewardId);
