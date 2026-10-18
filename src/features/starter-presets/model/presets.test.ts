import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/shared/api/db';
import { i18n } from '@/shared/i18n';
import { childrenCatalogue, createChild } from '@/entities/child';
import { tasksCatalogue } from '@/entities/task';
import { rewardsCatalogue } from '@/entities/reward';
import { renamePresets, seedPresets } from './presets';

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
  it('fills an empty device with one kid, five chores and four shop rewards in the current language', async () => {
    i18n.global.locale.value = 'en';

    const rows = await seedPresets();

    expect(rows).toHaveLength(10);
    expect((await childrenCatalogue.read()).map((child) => child.name)).toEqual(['Alex']);
    expect((await tasksCatalogue.read()).map((task) => task.name)).toEqual([
      'Brush teeth',
      'Make the bed',
      'Put toys away',
      'Do homework',
      'Read for 20 minutes',
    ]);
    const rewards = await rewardsCatalogue.read();
    expect(rewards.map((reward) => reward.points).sort((a, b) => a - b)).toEqual([10, 15, 40, 60]);
    expect(rewards.every((reward) => reward.visibility === 'shop')).toBe(true);
  });

  it('leaves a device with data alone', async () => {
    await createChild({ name: 'Тимофей', carColor: '#0A84FF', figure: 'truck', photo: '' });

    expect(await seedPresets()).toEqual([]);
    expect(await tasksCatalogue.count()).toBe(0);
    expect(await rewardsCatalogue.count()).toBe(0);
  });
});

describe('renamePresets', () => {
  it('renames the presets into the newly picked language', async () => {
    const rows = await seedPresets();
    i18n.global.locale.value = 'es';

    await renamePresets(rows);

    expect((await childrenCatalogue.read()).map((child) => child.name)).toEqual(['Álex']);
    expect((await tasksCatalogue.read())[0]?.name).toBe('Lavarse los dientes');
    expect((await rewardsCatalogue.read()).map((reward) => reward.name)).toContain('Helado');
  });
});
