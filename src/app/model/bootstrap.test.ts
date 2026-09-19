import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/shared/api/db';
import { childrenCatalogue, DEFAULT_CHILDREN } from '@/entities/child';
import { tasksCatalogue, DEFAULT_TASKS } from '@/entities/task';
import { rewardsCatalogue, DEFAULT_REWARDS } from '@/entities/reward';
import { getSettings } from '@/entities/settings';
import { bootstrap } from './bootstrap';

beforeEach(async () => {
  if (db.isOpen()) {
    db.close();
  }
  await db.delete();
  await db.open();
});

describe('bootstrap', () => {
  it('seeds every catalogue on an empty database', async () => {
    await bootstrap();

    const children = await childrenCatalogue.read();
    const tasks = await tasksCatalogue.read();
    const rewards = await rewardsCatalogue.read();

    expect(children).toHaveLength(DEFAULT_CHILDREN.length);
    expect(tasks).toHaveLength(DEFAULT_TASKS.length);
    expect(rewards).toHaveLength(DEFAULT_REWARDS.length);
  });

  it('keeps the identifiers history refers to', async () => {
    await bootstrap();

    const children = await childrenCatalogue.read();
    const tasks = await tasksCatalogue.read();
    const rewards = await rewardsCatalogue.read();

    expect(children.map((child) => child.id)).toEqual(['timofey', 'daniil']);
    expect(tasks.map((task) => task.id)).toEqual(['study', 'order', 'reading']);
    expect(rewards.map((reward) => reward.id)).toContain('euro-1');
  });

  it('leaves the bonus out of the task catalogue and keeps its rule in settings', async () => {
    await bootstrap();

    const tasks = await tasksCatalogue.read();
    const settings = await getSettings();

    expect(tasks.map((task) => task.id)).not.toContain('bonus');
    expect(settings?.bonus).toEqual({ enabled: true, points: 1 });
  });

  it('does not overwrite edited rows when run again', async () => {
    await bootstrap();
    const [first] = await childrenCatalogue.read();
    expect(first).toBeDefined();
    await childrenCatalogue.put({ ...first!, name: 'Переименован' });

    await bootstrap();

    const children = await childrenCatalogue.read();
    expect(children).toHaveLength(DEFAULT_CHILDREN.length);
    expect(children[0]?.name).toBe('Переименован');
  });

  it('adds a default that a later version introduced', async () => {
    await bootstrap();
    const before = await rewardsCatalogue.read();
    await rewardsCatalogue.table.delete('bubble-tea');
    expect(await rewardsCatalogue.read()).toHaveLength(before.length - 1);

    await bootstrap();

    const rewards = await rewardsCatalogue.read();
    expect(rewards).toHaveLength(before.length);
    expect(rewards.some((reward) => reward.id === 'bubble-tea')).toBe(true);
  });

  it('gives every seeded row an order and an active flag', async () => {
    await bootstrap();

    const tasks = await tasksCatalogue.read();

    expect(tasks.map((task) => task.order)).toEqual([0, 1, 2]);
    expect(tasks.every((task) => task.active)).toBe(true);
  });
});
