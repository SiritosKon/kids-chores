import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/shared/api/db';
import { bootstrap } from '@/app/model/bootstrap';
import { tasksCatalogue, STREAK_TASK_ID } from '@/entities/task';
import { saveDayMarks, getAllCompletions } from '@/entities/completion';
import { getStreaks } from '@/entities/streak';
import { getSettings, saveSettings } from '@/entities/settings';
import { recalculateStreaks } from './recalculate';

const closeDay = async (childId: string, day: string) => {
  const tasks = await tasksCatalogue.read();
  await saveDayMarks(
    childId,
    day,
    tasks.map((task) => ({ taskId: task.id, points: task.points }))
  );
};

const streakAwards = async () =>
  (await getAllCompletions()).filter((row) => row.taskId === STREAK_TASK_ID);

beforeEach(async () => {
  if (db.isOpen()) {
    db.close();
  }
  await db.delete();
  await db.open();
  await bootstrap();
});

describe('recalculateStreaks', () => {
  it('awards the points of a milestone once it is reached', async () => {
    await closeDay('timofey', '2026-09-16');
    await closeDay('timofey', '2026-09-17');
    await closeDay('timofey', '2026-09-18');

    await recalculateStreaks('2026-09-18');

    const awards = await streakAwards();
    expect(awards).toHaveLength(1);
    expect(awards[0]?.points).toBe(2);
    expect(awards[0]?.date).toBe('2026-09-18');
    expect(awards[0]?.childId).toBe('timofey');
  });

  it('stores the streak of every child', async () => {
    await closeDay('timofey', '2026-09-17');
    await closeDay('timofey', '2026-09-18');

    await recalculateStreaks('2026-09-18');

    const streaks = await getStreaks();
    expect(streaks.find((row) => row.childId === 'timofey')).toMatchObject({
      current: 2,
      best: 2,
      lastClosedDate: '2026-09-18',
    });
    expect(streaks.find((row) => row.childId === 'daniil')).toMatchObject({ current: 0, best: 0 });
  });

  it('does not double award when run again', async () => {
    await closeDay('timofey', '2026-09-16');
    await closeDay('timofey', '2026-09-17');
    await closeDay('timofey', '2026-09-18');

    await recalculateStreaks('2026-09-18');
    await recalculateStreaks('2026-09-18');
    await recalculateStreaks('2026-09-18');

    expect(await streakAwards()).toHaveLength(1);
  });

  it('takes the award back when history no longer earns it', async () => {
    await closeDay('timofey', '2026-09-16');
    await closeDay('timofey', '2026-09-17');
    await closeDay('timofey', '2026-09-18');
    await recalculateStreaks('2026-09-18');
    expect(await streakAwards()).toHaveLength(1);

    await saveDayMarks('timofey', '2026-09-17', []);
    await recalculateStreaks('2026-09-18');

    expect(await streakAwards()).toHaveLength(0);
    const streaks = await getStreaks();
    expect(streaks.find((row) => row.childId === 'timofey')?.current).toBe(1);
  });

  it('repeats a milestone every N days without resetting the streak', async () => {
    for (let index = 0; index < 6; index += 1) {
      await closeDay('timofey', `2026-09-${String(10 + index).padStart(2, '0')}`);
    }

    await recalculateStreaks('2026-09-15');

    const awards = await streakAwards();
    expect(awards.map((row) => row.date).sort()).toEqual(['2026-09-12', '2026-09-15']);
    const streaks = await getStreaks();
    expect(streaks.find((row) => row.childId === 'timofey')?.current).toBe(6);
  });

  it('stays out of the way when the streak is switched off', async () => {
    const settings = await getSettings();
    await saveSettings({ ...settings!, streak: { ...settings!.streak, enabled: false } });

    await closeDay('timofey', '2026-09-16');
    await closeDay('timofey', '2026-09-17');
    await closeDay('timofey', '2026-09-18');
    await recalculateStreaks('2026-09-18');

    expect(await streakAwards()).toHaveLength(0);
  });
});
