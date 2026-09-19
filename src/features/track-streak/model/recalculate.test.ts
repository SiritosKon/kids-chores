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

const september = (count: number, from = 10): string[] =>
  Array.from({ length: count }, (_, index) => `2026-09-${String(from + index).padStart(2, '0')}`);

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
  it('grants the seeded weekly reward once seven days are closed', async () => {
    await closeDays('timofey', september(7));

    await recalculateStreaks('2026-09-16');

    const rewards = await streakRewards();
    expect(rewards).toHaveLength(1);
    expect(rewards[0]).toMatchObject({
      childId: 'timofey',
      rewardId: 'bubble-tea',
      cost: 0,
      source: 'streak',
    });
  });

  it('grants a reward without touching the balance', async () => {
    await closeDays('timofey', september(7));

    await recalculateStreaks('2026-09-16');

    expect((await streakRewards()).every((row) => row.cost === 0)).toBe(true);
    expect(await streakPointAwards()).toHaveLength(0);
  });

  it('grants both the points and the reward when a milestone carries both', async () => {
    await setMilestones([{ id: 'three-days', days: 3, points: 2, rewardId: 'icecream-shop' }]);
    await closeDays('timofey', ['2026-09-16', '2026-09-17', '2026-09-18']);

    await recalculateStreaks('2026-09-18');

    const awards = await streakPointAwards();
    const rewards = await streakRewards();
    expect(awards).toHaveLength(1);
    expect(awards[0]?.points).toBe(2);
    expect(rewards).toHaveLength(1);
    expect(rewards[0]?.rewardId).toBe('icecream-shop');
  });

  it('gives points and reward the same identifier so neither is duplicated', async () => {
    await setMilestones([{ id: 'three-days', days: 3, points: 2, rewardId: 'icecream-shop' }]);
    await closeDays('timofey', ['2026-09-16', '2026-09-17', '2026-09-18']);

    await recalculateStreaks('2026-09-18');
    await recalculateStreaks('2026-09-18');

    expect(await streakPointAwards()).toHaveLength(1);
    expect(await streakRewards()).toHaveLength(1);
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
    await closeDays('timofey', september(7));

    await recalculateStreaks('2026-09-16');
    await recalculateStreaks('2026-09-16');
    await recalculateStreaks('2026-09-16');

    expect(await streakRewards()).toHaveLength(1);
  });

  it('takes the reward back when history no longer earns it', async () => {
    await closeDays('timofey', september(7));
    await recalculateStreaks('2026-09-16');
    expect(await streakRewards()).toHaveLength(1);

    await saveDayMarks('timofey', '2026-09-13', []);
    await recalculateStreaks('2026-09-16');

    expect(await streakRewards()).toHaveLength(0);
    const streaks = await getStreaks();
    expect(streaks.find((row) => row.childId === 'timofey')?.current).toBe(3);
  });

  it('repeats a milestone every N days without resetting the streak', async () => {
    await setMilestones([{ id: 'three-days', days: 3, rewardId: 'icecream-shop' }]);
    await closeDays('timofey', september(6));

    await recalculateStreaks('2026-09-15');

    expect(await streakRewards()).toHaveLength(2);
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

  it('reports an award only on the run that grants it', async () => {
    await closeDays('timofey', september(7));

    const first = await recalculateStreaks('2026-09-16');
    const second = await recalculateStreaks('2026-09-16');

    expect(first).toHaveLength(1);
    expect(first[0]).toMatchObject({
      childId: 'timofey',
      milestoneId: 'week',
      days: 7,
      rewardId: 'bubble-tea',
    });
    expect(second).toEqual([]);
  });

  it('reports nothing while the milestone is still out of reach', async () => {
    await closeDays('timofey', september(6));

    expect(await recalculateStreaks('2026-09-15')).toEqual([]);
  });

  it('reports one award per child that earned it', async () => {
    await closeDays('timofey', september(7));
    await closeDays('daniil', september(7));

    const granted = await recalculateStreaks('2026-09-16');

    expect(granted.map((award) => award.childId).sort()).toEqual(['daniil', 'timofey']);
  });

  it('stays out of the way when the streak is switched off', async () => {
    const settings = await getSettings();
    await saveSettings({ ...settings!, streak: { ...settings!.streak, enabled: false } });

    await closeDays('timofey', september(7));
    await recalculateStreaks('2026-09-16');

    expect(await streakRewards()).toHaveLength(0);
  });
});
