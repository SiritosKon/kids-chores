import { describe, expect, it } from 'vitest';
import type { Reward, RewardVariant } from '@/entities/reward';
import { goalEntry } from './goal';

const LEGO: Reward = {
  id: 'lego',
  name: 'Лего',
  icon: 'toys',
  points: 30,
  purchasable: true,
  visibility: 'shop',
  order: 0,
  active: true,
  createdAt: 0,
  updatedAt: 0,
};

const POLICE: RewardVariant = {
  id: 'police',
  rewardId: 'lego',
  name: 'Полицейский участок',
  order: 0,
  active: true,
  createdAt: 0,
  updatedAt: 0,
};

describe('goalEntry', () => {
  it('shows how much is saved towards the goal', () => {
    expect(goalEntry(LEGO, undefined, 12, '')).toMatchObject({
      name: 'Лего',
      price: 30,
      saved: 12,
      ratio: 0.4,
      ready: false,
    });
  });

  it('names the chosen variant and is ready once the balance covers the price', () => {
    expect(goalEntry(LEGO, POLICE, 45, 'photo')).toMatchObject({
      name: 'Лего → Полицейский участок',
      saved: 30,
      ratio: 1,
      ready: true,
      photo: 'photo',
    });
  });

  it('never shows a negative balance', () => {
    expect(goalEntry(LEGO, undefined, -3, '')).toMatchObject({ saved: 0, ratio: 0 });
  });

  it('drops a goal whose reward was removed or cannot be bought', () => {
    expect(goalEntry(undefined, undefined, 10, '')).toBeNull();
    expect(goalEntry({ ...LEGO, active: false }, undefined, 10, '')).toBeNull();
    expect(goalEntry({ ...LEGO, purchasable: false, visibility: 'hidden' }, undefined, 10, '')).toBeNull();
  });
});
