import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/shared/api/db';
import { childrenCatalogue } from '@/entities/child';
import { tasksCatalogue } from '@/entities/task';
import { rewardsCatalogue } from '@/entities/reward';
import { getSettings } from '@/entities/settings';
import { seedFamily } from '../../../tests/fixtures/family';
import { bootstrap } from './bootstrap';

beforeEach(async () => {
  if (db.isOpen()) {
    db.close();
  }
  await db.delete();
  await db.open();
});

describe('bootstrap', () => {
  it('leaves an empty database empty', async () => {
    await bootstrap();

    expect(await childrenCatalogue.read()).toEqual([]);
    expect(await tasksCatalogue.read()).toEqual([]);
    expect(await rewardsCatalogue.read()).toEqual([]);
    expect(await getSettings()).toBeUndefined();
  });

  it('does not touch stored rows', async () => {
    await seedFamily();
    const [first] = await childrenCatalogue.read();
    await childrenCatalogue.put({ ...first!, name: 'Переименован' });
    await rewardsCatalogue.table.delete('bubble-tea');

    await bootstrap();

    const children = await childrenCatalogue.read();
    expect(children[0]?.name).toBe('Переименован');
    expect((await rewardsCatalogue.read()).some((reward) => reward.id === 'bubble-tea')).toBe(false);
  });
});
