import { transaction } from '@/shared/api/db';
import { todayKey } from '@/shared/lib/date';
import { childrenCatalogue } from '@/entities/child';
import { tasksCatalogue, STREAK_TASK_ID } from '@/entities/task';
import { completionsTable, getAllCompletions, type Completion } from '@/entities/completion';
import { spendsTable, getAllSpends, type Spend } from '@/entities/spend';
import { getSettings } from '@/entities/settings';
import { streaksTable, summariseStreak, type StreakState } from '@/entities/streak';

const awardId = (childId: string, milestoneId: string, day: string): string =>
  `streak:${childId}:${milestoneId}:${day}`;

const dayTimestamp = (day: string): number => new Date(`${day}T12:00:00`).getTime();

export const recalculateStreaks = async (today: string = todayKey()): Promise<void> => {
  const settings = await getSettings();
  if (!settings?.streak.enabled) {
    return;
  }

  const [children, tasks, completions, spends] = await Promise.all([
    childrenCatalogue.read(),
    tasksCatalogue.read(),
    getAllCompletions(),
    getAllSpends(),
  ]);

  const requiredIds = tasks.filter((task) => task.active).map((task) => task.id);
  const states: StreakState[] = [];
  const expectedCompletions = new Map<string, Completion>();
  const expectedSpends = new Map<string, Spend>();
  const now = Date.now();

  for (const child of children) {
    const own = completions.filter((row) => row.childId === child.id);
    const marksByDay = new Map<string, Set<string>>();
    for (const row of own) {
      const marks = marksByDay.get(row.date) ?? new Set<string>();
      marks.add(row.taskId);
      marksByDay.set(row.date, marks);
    }

    const closedDays =
      requiredIds.length === 0
        ? []
        : [...marksByDay.entries()]
            .filter(([, marks]) => requiredIds.every((taskId) => marks.has(taskId)))
            .map(([day]) => day);

    const summary = summariseStreak(closedDays, settings.streak.milestones, today);

    states.push({
      childId: child.id,
      current: summary.current,
      best: summary.best,
      lastClosedDate: summary.lastClosedDate,
      updatedAt: now,
    });

    for (const hit of summary.hits) {
      const id = awardId(child.id, hit.milestoneId, hit.day);
      if (hit.points !== undefined && hit.points > 0) {
        expectedCompletions.set(id, {
          id,
          childId: child.id,
          taskId: STREAK_TASK_ID,
          date: hit.day,
          points: hit.points,
          createdAt: dayTimestamp(hit.day),
          updatedAt: now,
        });
      }
      if (hit.rewardId !== undefined) {
        expectedSpends.set(id, {
          id,
          childId: child.id,
          rewardId: hit.rewardId,
          cost: 0,
          createdAt: dayTimestamp(hit.day),
          source: 'streak',
        });
      }
    }
  }

  const staleCompletions = completions
    .filter((row) => row.taskId === STREAK_TASK_ID && !expectedCompletions.has(row.id))
    .map((row) => row.id);
  const staleSpends = spends
    .filter((row) => row.source === 'streak' && !expectedSpends.has(row.id))
    .map((row) => row.id);

  await transaction([completionsTable, spendsTable, streaksTable], async () => {
    if (staleCompletions.length > 0) {
      await completionsTable.bulkDelete(staleCompletions);
    }
    if (staleSpends.length > 0) {
      await spendsTable.bulkDelete(staleSpends);
    }
    if (expectedCompletions.size > 0) {
      await completionsTable.bulkPut([...expectedCompletions.values()]);
    }
    if (expectedSpends.size > 0) {
      await spendsTable.bulkPut([...expectedSpends.values()]);
    }
    await streaksTable.bulkPut(states);
  });
};
