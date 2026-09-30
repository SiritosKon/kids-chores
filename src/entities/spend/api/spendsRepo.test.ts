import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/shared/api/db';
import { spendsTable, addSpend, chooseSpendVariant, getAllSpends } from './spendsRepo';

beforeEach(async () => {
  if (db.isOpen()) {
    db.close();
  }
  await db.delete();
  await db.open();
});

describe('spends repository', () => {
  it('reads an old row without a variant as it is', async () => {
    await spendsTable.put({ id: 'old', childId: 'timofey', rewardId: 'lego', cost: 60, createdAt: 1, source: 'purchase' });

    const [spend] = await getAllSpends();

    expect(spend).not.toHaveProperty('variantId');
  });

  it('stores the chosen variant with the purchase', async () => {
    await addSpend('timofey', 'lego', 60, { variantId: 'police', variantName: 'Полицейский участок' });

    const [spend] = await getAllSpends();

    expect(spend).toMatchObject({ cost: 60, variantId: 'police', variantName: 'Полицейский участок' });
    expect(spend?.chosenAt).toBeDefined();
  });

  it('adds a choice to a prize given earlier', async () => {
    await spendsTable.put({ id: 'prize', childId: 'timofey', rewardId: 'lego', cost: 0, createdAt: 1, source: 'streak' });

    await chooseSpendVariant('prize', { variantId: 'fire', variantName: 'Пожарная станция' });

    expect((await getAllSpends())[0]).toMatchObject({ source: 'streak', variantName: 'Пожарная станция' });
  });
});
