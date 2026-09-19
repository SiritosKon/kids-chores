import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/shared/api/db';
import { bootstrap } from '@/app/model/bootstrap';
import { tasksCatalogue, STREAK_TASK_ID } from '@/entities/task';
import { saveDayMarks, getAllCompletions } from '@/entities/completion';
import { getAllSpends } from '@/entities/spend';
import { getStreaks } from '@/entities/streak';
import { getSettings, saveSettings, type StreakMilestone } from '@/entities/settings';
import { recalculateStreaks } from './recalculate';

const closeDay = async (childId: string, day: string) => {
  const tasks = await tasksCatalogue.read();
  await saveDayMarks(
    childId,
    day,
    tasks.map((task) => ({ taskId: task.id, points: task.points }))
  );
};

const closeDays = async (childId: string, days: string[]) => {
  for (const day of days) {
    await closeDay(childId, day);
  }
};

const setMilestones = async (milestones: StreakMilestone[]) => {
  const settings = await getSettings();
  await saveSettings({ ...settings!, streak: { enabled: true, milestones } });
};

const streakPointAwards = async () =>
  (await getAllCompletions()).filter((row) => row.taskId === STREAK_TASK_ID);

const streakRewards = async () => (await getAllSpends()).filter((row) => row.source === 'streak');

beforeEach(async () => {
  if (db.isOpen()) {
    db.close();
  }
  await db.delete();
  await db.open();
  await bootstrap();
});

describe('recalculateStreaks', () => {
  it('grants the reward of a milestone once it is reached', async () => {
    await closeDays('timofey', ['2026-09-16', '2026-09-17', '2026-09-18']);

    await recalculateStreaks('2026-09-18');

    const rewards = await streakRewards();
    expect(rewards).toHaveLength(1);
    expect(rewards[0]).toMatchObject({
      childId: 'timofey',
      rewardId: 'icecream-shop',
      cost: 0,
      source: 'streak',
    });
  });

  it('grants a reward without touching the balance', async () => {
    await closeDays('timofey', ['2026-09-16', '2026-09-17', '2026-09-18']);

    await recalculateStreaks('2026-09-18');

    const rewards = await streakRewards();
    expect(rewards.every((row) => row.cost === 0)).toBe(true);
    expect(await streakPointAwards()).toHaveLength(0);
  });

  it('still awards points when a milestone is configured with them', async () => {
    await setMilestones([{ id: 'three-days', days: 3, points: 2 }]);
    await closeDays('timofey', ['2026-09-16', '2026-09-17', '2026-09-18']);

    await recalculateStreaks('2026-09-18');

    const awards = await streakPointAwards();
    expect(awards).toHaveLength(1);
    expect(awards[0]?.points).toBe(2);
  });

  it('stores the streak of every child', async () => {
    await closeDays('timofey', ['2026-09-17', '2026-09-18']);

    await recalculateStreaks('2026-09-18');

    const streaks = await getStreaks();
    expect(streaks.find((row) => row.childId === 'timofey')).toMatchObject({
      current: 2,
      best: 2,
      lastClosedDate: '2026-09-18',
    });
    expect(streaks.find((row) => row.childId === 'daniil')).toMatchObject({ current: 0, best: 0 });
  });

  it('does not grant the same reward twice when run again', async () => {
    await closeDays('timofey', ['2026-09-16', '2026-09-17', '2026-09-18']);

    await recalculateStreaks('2026-09-18');
    await recalculateStreaks('2026-09-18');
    await recalculateStreaks('2026-09-18');

    expect(await streakRewards()).toHaveLength(1);
  });

  it('takes the reward back when history no longer earns it', async () => {
    await closeDays('timofey', ['2026-09-16', '2026-09-17', '2026-09-18']);
    await recalculateStreaks('2026-09-18');
    expect(await streakRewards()).toHaveLength(1);

    await saveDayMarks('timofey', '2026-09-17', []);
    await recalculateStreaks('2026-09-18');

    expect(await streakRewards()).toHaveLength(0);
    const streaks = await getStreaks();
    expect(streaks.find((row) => row.childId === 'timofey')?.current).toBe(1);
  });

  it('repeats a milestone every N days without resetting the streak', async () => {
    await closeDays(
      'timofey',
      Array.from({ length: 6 }, (_, index) => `2026-09-${String(10 + index).padStart(2, '0')}`)
    );

    await recalculateStreaks('2026-09-15');

    const rewards = await streakRewards();
    expect(rewards).toHaveLength(2);
    const streaks = await getStreaks();
    expect(streaks.find((row) => row.childId === 'timofey')?.current).toBe(6);
  });

  it('drops point awards left by an earlier configuration', async () => {
    await setMilestones([{ id: 'three-days', days: 3, points: 2 }]);
    await closeDays('timofey', ['2026-09-16', '2026-09-17', '2026-09-18']);
    await recalculateStreaks('2026-09-18');
    expect(await streakPointAwards()).toHaveLength(1);

    await setMilestones([{ id: 'three-days', days: 3, rewardId: 'icecream-shop' }]);
    await recalculateStreaks('2026-09-18');

    expect(await streakPointAwards()).toHaveLength(0);
    expect(await streakRewards()).toHaveLength(1);
  });

  it('stays out of the way when the streak is switched off', async () => {
    const settings = await getSettings();
    await saveSettings({ ...settings!, streak: { ...settings!.streak, enabled: false } });

    await closeDays('timofey', ['2026-09-16', '2026-09-17', '2026-09-18']);
    await recalculateStreaks('2026-09-18');

    expect(await streakRewards()).toHaveLength(0);
  });
});
