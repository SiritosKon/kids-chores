import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/shared/api/db';
import { getDayCompletions, saveDayMarks } from './completionsRepo';

beforeEach(async () => {
  if (db.isOpen()) {
    db.close();
  }
  await db.delete();
  await db.open();
});

describe('saveDayMarks', () => {
  it('replaces the marks of the day', async () => {
    await saveDayMarks('tim', '2026-10-07', [{ taskId: 'study', points: 1 }, { taskId: 'reading', points: 1 }]);

    await saveDayMarks('tim', '2026-10-07', [{ taskId: 'study', points: 1 }]);

    expect((await getDayCompletions('tim', '2026-10-07')).map((row) => row.taskId)).toEqual(['study']);
  });

  it('keeps the marks of tasks outside the given scope', async () => {
    await saveDayMarks('tim', '2026-10-07', [{ taskId: 'study', points: 1 }, { taskId: 'removed-quest', points: 3 }]);

    await saveDayMarks('tim', '2026-10-07', [], new Set(['study']));

    expect((await getDayCompletions('tim', '2026-10-07')).map((row) => row.taskId)).toEqual(['removed-quest']);
  });
});
