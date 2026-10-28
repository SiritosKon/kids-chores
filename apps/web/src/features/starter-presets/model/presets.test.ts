import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/shared/api/db';
import { i18n } from '@/shared/i18n';
import { childrenCatalogue, createChild } from '@/entities/child';
import { tasksCatalogue } from '@/entities/task';
import { rewardsCatalogue } from '@/entities/reward';
import { seedPresets } from './presets';

beforeEach(async () => {
  if (db.isOpen()) {
    db.close();
  }
  await db.delete();
  await db.open();
});

afterEach(() => {
  i18n.global.locale.value = 'ru';
});

describe('seedPresets', () => {
  it('fills an empty device with one kid, three chores and three shop rewards in the current language', async () => {
    i18n.global.locale.value = 'en';

    await seedPresets();

    expect((await childrenCatalogue.read()).map((child) => child.name)).toEqual(['Kid']);
    expect((await tasksCatalogue.read()).map((task) => task.name)).toEqual([
      'Brush teeth',
      'Make the bed',
      'Put toys away',
    ]);
    const rewards = await rewardsCatalogue.read();
    expect(rewards.map((reward) => reward.points).sort((a, b) => a - b)).toEqual([10, 15, 60]);
    expect(rewards.every((reward) => reward.visibility === 'shop')).toBe(true);
  });

  it('leaves a device with data alone', async () => {
    await createChild({ name: 'Тимофей', carColor: '#0A84FF', figure: 'truck', photo: '' });

    await seedPresets();

    expect(await childrenCatalogue.count()).toBe(1);
    expect(await tasksCatalogue.count()).toBe(0);
    expect(await rewardsCatalogue.count()).toBe(0);
  });
});
