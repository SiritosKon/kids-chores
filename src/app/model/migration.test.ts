import Dexie from 'dexie';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/shared/api/db';
import { getAllCompletions } from '@/entities/completion';
import { childrenCatalogue } from '@/entities/child';
import { tasksCatalogue, reservedTaskName } from '@/entities/task';
import { getSettings } from '@/entities/settings';
import { bootstrap } from './bootstrap';

const LEGACY_COMPLETIONS = [
  ['timofey', 'study', '2026-09-16'],
  ['timofey', 'order', '2026-09-16'],
  ['timofey', 'reading', '2026-09-16'],
  ['timofey', 'bonus', '2026-09-16'],
  ['daniil', 'study', '2026-09-16'],
  ['daniil', 'reading', '2026-09-17'],
].map(([childId, taskId, date], index) => ({
  id: `legacy-${index}`,
  childId,
  taskId,
  date,
  points: 1,
  createdAt: 1789600000000 + index,
  updatedAt: 1789600000000 + index,
}));

const openLegacyDatabase = async () => {
  const legacy = new Dexie('kids-chores');
  legacy.version(3).stores({
    completions: 'id, childId, date, [childId+date], [childId+taskId+date]',
    spends: 'id, childId, rewardId, createdAt',
    versionLog: 'version, firstSeenAt',
  });
  await legacy.open();
  await legacy.table('completions').bulkAdd(LEGACY_COMPLETIONS);
  await legacy.table('spends').add({
    id: 'legacy-spend',
    childId: 'daniil',
    rewardId: 'euro-1',
    cost: 4,
    createdAt: 1789600000000,
  });
  legacy.close();
};

beforeEach(async () => {
  if (db.isOpen()) {
    db.close();
  }
  await db.delete();
});

describe('schema upgrade from 3 to 4 on a device with history', () => {
  it('keeps history readable once the catalogues are seeded', async () => {
    await openLegacyDatabase();

    await db.open();
    await bootstrap();

    const completions = await getAllCompletions();
    const children = await childrenCatalogue.read();
    const tasks = await tasksCatalogue.read();

    const nameOf = (taskId: string) =>
      reservedTaskName(taskId) ?? tasks.find((task) => task.id === taskId)?.name ?? taskId;

    expect(completions).toHaveLength(LEGACY_COMPLETIONS.length);
    expect(
      [...new Set(completions.map((row) => row.taskId))].filter((id) => nameOf(id) === id)
    ).toEqual([]);
    expect(
      [...new Set(completions.map((row) => row.childId))].filter(
        (id) => !children.some((child) => child.id === id)
      )
    ).toEqual([]);
  });

  it('keeps the reserved bonus readable although it is not in the catalogue', async () => {
    await openLegacyDatabase();

    await db.open();
    await bootstrap();

    const tasks = await tasksCatalogue.read();
    expect(tasks.some((task) => task.id === 'bonus')).toBe(false);
    expect(reservedTaskName('bonus')).toBe('Доп. баллы');
  });

  it('adds no new fields to rows written by older versions', async () => {
    await openLegacyDatabase();

    await db.open();
    await bootstrap();

    const completions = await getAllCompletions();
    const first = completions.find((row) => row.id === 'legacy-0');
    expect(first).toBeDefined();
    expect(Object.keys(first!).sort()).toEqual(
      ['childId', 'createdAt', 'date', 'id', 'points', 'taskId', 'updatedAt'].sort()
    );
  });

  it('creates the settings the old device never had', async () => {
    await openLegacyDatabase();

    await db.open();
    await bootstrap();

    const settings = await getSettings();
    expect(settings?.bonus).toEqual({ enabled: true, points: 1 });
    expect(settings?.parentPassword).not.toBe('');
  });
});
