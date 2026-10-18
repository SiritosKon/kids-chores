import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/shared/api/db';
import {
  tasksCatalogue,
  createTask,
  setTaskActive,
  assignTask,
  updateQuest,
  archiveTask,
  trimRemovedTasks,
} from './tasksRepo';
import { isQuestOpenOn, isTaskRequiredOn, questDates } from '../lib/schedule';

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

  it('gives a task to some children from today and keeps the past for everyone', async () => {
    const task = await createTask(DRAFT, '2026-09-01');

    await assignTask(task.id, ['tim'], '2026-09-20');

    const stored = await tasksCatalogue.get(task.id);
    expect(stored?.childIds).toEqual(['tim']);
    expect(stored?.activePeriods).toEqual([
      { from: '2026-09-01', to: '2026-09-20' },
      { from: '2026-09-20', childIds: ['tim'] },
    ]);
  });

  it('reopens a switched-off task for the children it is given to', async () => {
    const task = await createTask(DRAFT, '2026-09-01');
    await setTaskActive(task.id, false, '2026-09-10');

    await assignTask(task.id, ['tim'], '2026-09-12');
    await setTaskActive(task.id, true, '2026-09-15');

    const stored = await tasksCatalogue.get(task.id);
    expect(stored?.activePeriods).toEqual([
      { from: '2026-09-01', to: '2026-09-10' },
      { from: '2026-09-15', childIds: ['tim'] },
    ]);
  });

  it('opens a quest from its first to its last day and never requires it', async () => {
    const quest = await createTask(DRAFT, '2026-09-20', {
      quest: { from: '2026-09-20', lastDay: '2026-09-21' },
      childIds: ['tim'],
    });

    expect(quest.quest).toBe(true);
    expect(quest.activePeriods).toEqual([{ from: '2026-09-20', to: '2026-09-22', childIds: ['tim'] }]);
    expect(isQuestOpenOn(quest, '2026-09-21', 'tim')).toBe(true);
    expect(isQuestOpenOn(quest, '2026-09-22', 'tim')).toBe(false);
    expect(isQuestOpenOn(quest, '2026-09-21', 'dan')).toBe(false);
    expect(isTaskRequiredOn(quest, '2026-09-21', 'tim')).toBe(false);
    expect(questDates(quest)).toEqual({ from: '2026-09-20', lastDay: '2026-09-21' });
  });

  it('starts a quest on a later day', async () => {
    const quest = await createTask(DRAFT, '2026-09-20', { quest: { from: '2026-09-25', lastDay: '2026-09-27' } });

    expect(isQuestOpenOn(quest, '2026-09-24')).toBe(false);
    expect(isQuestOpenOn(quest, '2026-09-25')).toBe(true);
    expect(isQuestOpenOn(quest, '2026-09-27')).toBe(true);
  });

  it('moves the quest dates and children', async () => {
    const quest = await createTask(DRAFT, '2026-09-20', { quest: { from: '2026-09-20', lastDay: '2026-09-21' } });

    await updateQuest(quest.id, { from: '2026-09-20', lastDay: '2026-09-24' }, ['dan']);

    const stored = await tasksCatalogue.get(quest.id);
    expect(stored?.activePeriods).toEqual([{ from: '2026-09-20', to: '2026-09-25', childIds: ['dan'] }]);
  });

  it('takes a removed quest off the board from today', async () => {
    const quest = await createTask(DRAFT, '2026-09-20', { quest: { from: '2026-09-20', lastDay: '2026-09-23' } });

    await archiveTask(quest.id, '2026-09-21');

    const stored = await tasksCatalogue.get(quest.id);
    expect(stored?.activePeriods).toEqual([{ from: '2026-09-20', to: '2026-09-21' }]);
    expect(isQuestOpenOn(stored!, '2026-09-21')).toBe(false);
  });

  it('drops a removed quest that has not started yet', async () => {
    const quest = await createTask(DRAFT, '2026-09-20', { quest: { from: '2026-09-25', lastDay: '2026-09-27' } });

    await archiveTask(quest.id, '2026-09-21');

    expect((await tasksCatalogue.get(quest.id))?.activePeriods).toEqual([]);
  });

  it('trims a quest removed before removal cut its dates', async () => {
    const quest = await createTask(DRAFT, '2026-09-20', { quest: { from: '2026-09-20', lastDay: '2026-09-23' } });
    const removedAt = new Date('2026-09-21T15:00:00').getTime();
    await tasksCatalogue.put({ ...quest, active: false, archivedAt: removedAt });

    await trimRemovedTasks();

    expect((await tasksCatalogue.get(quest.id))?.activePeriods).toEqual([{ from: '2026-09-20', to: '2026-09-21' }]);
  });

  it('leaves tasks that are still in use alone', async () => {
    const task = await createTask(DRAFT, '2026-09-01');
    const before = await tasksCatalogue.get(task.id);

    await trimRemovedTasks();

    expect(await tasksCatalogue.get(task.id)).toEqual(before);
  });
});
