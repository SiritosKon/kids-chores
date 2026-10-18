import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/shared/api/db';
import { rewardsCatalogue, createReward, updateReward, archiveReward } from './rewardsRepo';

const DRAFT = {
  name: 'Мультик',
  icon: 'movie',
  points: 6,
  visibility: 'shop' as const,
};

beforeEach(async () => {
  if (db.isOpen()) {
    db.close();
  }
  await db.delete();
  await db.open();
});

describe('rewards repository', () => {
  it('keeps a custom colour when the reward is edited', async () => {
    const reward = await createReward(DRAFT);
    await rewardsCatalogue.update(reward.id, { color: '#FF9F0A' });

    await updateReward(reward.id, { ...DRAFT, points: 8, visibility: 'streak' });

    const stored = await rewardsCatalogue.get(reward.id);
    expect(stored).toMatchObject({ points: 8, visibility: 'streak', color: '#FF9F0A', purchasable: false });
  });

  it('sells a reward only when it sits in the shop', async () => {
    const reward = await createReward(DRAFT);

    expect(reward.purchasable).toBe(true);
  });

  it('archives a reward instead of deleting the row', async () => {
    const reward = await createReward(DRAFT);

    await archiveReward(reward.id);

    const stored = await rewardsCatalogue.get(reward.id);
    expect(stored?.active).toBe(false);
    expect(stored?.archivedAt).toBeTypeOf('number');
  });

  it('keeps a streak prize without a price', async () => {
    const reward = await createReward({ ...DRAFT, points: 0, visibility: 'streak' });

    expect(await rewardsCatalogue.get(reward.id)).toMatchObject({ points: 0, purchasable: false });
  });
});
