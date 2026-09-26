import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/shared/api/db';
import { tasksCatalogue, createTask, setTaskActive, archiveTask } from './tasksRepo';

const DRAFT = { name: 'Спорт', icon: 'fitness_center', color: '#30D158', points: 2 };

beforeEach(async () => {
  if (db.isOpen()) {
    db.close();
  }
  await db.delete();
  await db.open();
});

describe('tasks repository', () => {
  it('makes a new task due from the day it was created', async () => {
    const task = await createTask(DRAFT, '2026-09-26');

    expect(task.activePeriods).toEqual([{ from: '2026-09-26' }]);
  });

  it('closes and reopens the activity period when switched off and on', async () => {
    const task = await createTask(DRAFT, '2026-09-01');

    await setTaskActive(task.id, false, '2026-09-10');
    await setTaskActive(task.id, true, '2026-09-15');

    const stored = await tasksCatalogue.get(task.id);
    expect(stored?.active).toBe(true);
    expect(stored?.activePeriods).toEqual([
      { from: '2026-09-01', to: '2026-09-10' },
      { from: '2026-09-15' },
    ]);
  });

  it('closes the period and keeps the row when a task is removed', async () => {
    const task = await createTask(DRAFT, '2026-09-01');

    await archiveTask(task.id, '2026-09-20');

    const stored = await tasksCatalogue.get(task.id);
    expect(stored?.archivedAt).toBeTypeOf('number');
    expect(stored?.active).toBe(false);
    expect(stored?.activePeriods).toEqual([{ from: '2026-09-01', to: '2026-09-20' }]);
  });
});
