import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/shared/api/db';
import { EARLIEST_DAY_KEY } from '@/shared/lib/constants';
import { tasksCatalogue, STREAK_TASK_ID } from '@/entities/task';
import { saveDayMarks, getAllCompletions } from '@/entities/completion';
import { getAllSpends, spendsTable } from '@/entities/spend';
import { getStreaks, streaksTable } from '@/entities/streak';
import { getSettings, saveSettings, type StreakMilestone } from '@/entities/settings';
import { seedFamily, FAMILY_TASKS } from '../../../../tests/fixtures/family';
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
  await seedFamily();
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

  it('grants a stage once per run, not every N days', async () => {
    await setMilestones([{ id: 'three-days', days: 3, rewardId: 'icecream-shop' }]);
    await closeDays('timofey', september(6));

    await recalculateStreaks('2026-09-15');

    expect(await streakRewards()).toHaveLength(1);
    const streaks = await getStreaks();
    expect(streaks.find((row) => row.childId === 'timofey')?.current).toBe(6);
  });

  it('grants every stage of the ladder in one run', async () => {
    await setMilestones([
      { id: 'week', days: 7, rewardId: 'bubble-tea' },
      { id: 'fortnight', days: 15, rewardId: 'icecream-shop' },
    ]);
    await closeDays('timofey', september(15));

    await recalculateStreaks('2026-09-24');

    expect((await streakRewards()).map((row) => row.rewardId).sort()).toEqual(['bubble-tea', 'icecream-shop']);
  });

  it('drops a prize an earlier version gave for day 14', async () => {
    await closeDays('timofey', september(14));
    await spendsTable.put({
      id: 'streak:timofey:week:2026-09-23',
      childId: 'timofey',
      rewardId: 'bubble-tea',
      cost: 0,
      createdAt: 1789600000000,
      source: 'streak',
    });

    await recalculateStreaks('2026-09-23');

    expect((await streakRewards()).map((row) => row.id)).toEqual(['streak:timofey:week:2026-09-16']);
  });

  it('congratulates a new run after counters from the old rule are reset', async () => {
    await closeDays('timofey', september(7));
    await recalculateStreaks('2026-09-16');
    const [state] = (await getStreaks()).filter((row) => row.childId === 'timofey');
    await streaksTable.put({ ...state!, celebrated: { week: 2 }, hitRule: 'every' });

    expect(await recalculateStreaks('2026-09-16')).toEqual([]);
    await closeDays('timofey', september(7, 18));

    expect(await recalculateStreaks('2026-09-24')).toHaveLength(1);
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

  it('keeps a finished streak when a task is added later', async () => {
    await closeDays('timofey', september(7));
    await recalculateStreaks('2026-09-16');

    await tasksCatalogue.put({ ...FAMILY_TASKS[0]!, id: 'sport', activePeriods: [{ from: '2026-09-17' }] });
    await recalculateStreaks('2026-09-17');

    expect(await streakRewards()).toHaveLength(1);
    const streaks = await getStreaks();
    expect(streaks.find((row) => row.childId === 'timofey')?.current).toBe(7);
  });

  it('keeps a finished streak when a task is switched off later', async () => {
    await closeDays('timofey', september(7));
    await recalculateStreaks('2026-09-16');
    const reading = FAMILY_TASKS.find((task) => task.id === 'reading')!;

    await tasksCatalogue.put({
      ...reading,
      active: false,
      activePeriods: [{ from: EARLIEST_DAY_KEY, to: '2026-09-17' }],
    });
    await saveDayMarks('timofey', '2026-09-12', [
      { taskId: 'study', points: 1 },
      { taskId: 'order', points: 1 },
    ]);
    await recalculateStreaks('2026-09-17');

    expect(await streakRewards()).toHaveLength(0);
    const streaks = await getStreaks();
    expect(streaks.find((row) => row.childId === 'timofey')?.current).toBe(4);
  });

  it('keeps prizes of a milestone that was replaced', async () => {
    await closeDays('timofey', september(7));
    await recalculateStreaks('2026-09-16');

    await setMilestones([
      { id: 'week', days: 7, rewardId: 'bubble-tea', to: '2026-09-17' },
      { id: 'week-2', days: 7, points: 3, from: '2026-09-17' },
    ]);
    await closeDays('timofey', september(7, 18));
    await recalculateStreaks('2026-09-24');

    const rewards = await streakRewards();
    expect(rewards.map((row) => row.rewardId)).toEqual(['bubble-tea']);
    expect((await streakPointAwards()).map((row) => row.date)).toEqual(['2026-09-24']);
  });

  it('does not congratulate twice when an edit moves the prize day', async () => {
    await closeDays('timofey', september(8));
    expect(await recalculateStreaks('2026-09-17')).toHaveLength(1);

    await saveDayMarks('timofey', '2026-09-10', []);
    expect(await recalculateStreaks('2026-09-17')).toHaveLength(0);
    expect(await streakRewards()).toHaveLength(1);

    await closeDay('timofey', '2026-09-10');
    expect(await recalculateStreaks('2026-09-17')).toHaveLength(0);
  });

  it('congratulates again once a new prize is really earned', async () => {
    await closeDays('timofey', september(7));
    expect(await recalculateStreaks('2026-09-16')).toHaveLength(1);

    await closeDays('timofey', september(7, 18));

    expect(await recalculateStreaks('2026-09-24')).toHaveLength(1);
  });

  it('congratulates once per prize when past days are filled in backwards', async () => {
    const days = [...september(7), ...september(7, 18)].reverse();
    let congratulations = 0;

    for (const day of days) {
      await closeDay('timofey', day);
      congratulations += (await recalculateStreaks('2026-09-24')).length;
    }

    expect(congratulations).toBe(2);
    expect(await streakRewards()).toHaveLength(2);
  });
});
