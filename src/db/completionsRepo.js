import { db } from './db.js';
import { TASKS } from '../config/tasks.js';
import { weekDayKeys } from '../composables/useWeek.js';

const EXPORT_VERSION = 2;

export function getDayCompletions(childId, dateKey) {
  return db.completions.where('[childId+date]').equals([childId, dateKey]).toArray();
}

export async function saveDayMarks(childId, dateKey, checkedTaskIds) {
  const existing = await getDayCompletions(childId, dateKey);
  const checked = new Set(checkedTaskIds);
  const existingTaskIds = new Set(existing.map((row) => row.taskId));

  const toAdd = [];
  for (const taskId of checked) {
    if (existingTaskIds.has(taskId)) {
      continue;
    }
    const task = TASKS.find((item) => item.id === taskId);
    if (!task) {
      continue;
    }
    const now = Date.now();
    toAdd.push({
      id: crypto.randomUUID(),
      childId,
      taskId,
      date: dateKey,
      points: task.points,
      createdAt: now,
      updatedAt: now,
    });
  }

  const toDelete = [];
  for (const row of existing) {
    if (!checked.has(row.taskId)) {
      toDelete.push(row.id);
    }
  }

  await db.transaction('rw', db.completions, async () => {
    if (toDelete.length > 0) {
      await db.completions.bulkDelete(toDelete);
    }
    if (toAdd.length > 0) {
      await db.completions.bulkAdd(toAdd);
    }
  });
}

export async function resetWeek(childId, referenceDate = new Date()) {
  const keys = weekDayKeys(referenceDate);
  const pairs = keys.map((key) => [childId, key]);
  await db.completions.where('[childId+date]').anyOf(pairs).delete();
}

export async function exportAll() {
  const [completions, spends] = await Promise.all([db.completions.toArray(), db.spends.toArray()]);
  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    completions,
    spends,
  };
}

export async function exportMonth(year, month) {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  const [completions, spends] = await Promise.all([db.completions.toArray(), db.spends.toArray()]);
  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    completions: completions.filter((row) => row.date.startsWith(prefix)),
    spends: spends.filter((spend) => {
      const date = new Date(spend.createdAt);
      const spendPrefix = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return spendPrefix === prefix;
    }),
  };
}

export async function importAll(data) {
  if (!data || typeof data !== 'object' || !Array.isArray(data.completions)) {
    throw new Error('нет массива completions');
  }

  const completionsValid = data.completions.every(
    (row) =>
      row &&
      typeof row.id === 'string' &&
      typeof row.childId === 'string' &&
      typeof row.taskId === 'string' &&
      typeof row.date === 'string' &&
      typeof row.points === 'number'
  );
  if (!completionsValid) {
    throw new Error('неверный формат отметок');
  }

  const spends = Array.isArray(data.spends) ? data.spends : [];
  const spendsValid = spends.every(
    (row) =>
      row &&
      typeof row.id === 'string' &&
      typeof row.childId === 'string' &&
      typeof row.rewardId === 'string' &&
      typeof row.cost === 'number'
  );
  if (!spendsValid) {
    throw new Error('неверный формат списаний');
  }

  await db.transaction('rw', [db.completions, db.spends], async () => {
    await db.completions.clear();
    await db.completions.bulkAdd(data.completions);
    await db.spends.clear();
    if (spends.length > 0) {
      await db.spends.bulkAdd(spends);
    }
  });
}
