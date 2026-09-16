import { ref, onUnmounted } from 'vue';
import { liveQuery } from 'dexie';
import { db } from '../db/db.js';
import { CHILDREN } from '../config/children.js';
import { weekDayKeys } from './useWeek.js';

function buildEntries(rows) {
  return CHILDREN.map((child) => {
    let points = 0;
    for (const row of rows) {
      if (row.childId === child.id) {
        points += row.points;
      }
    }
    const ratio = child.weeklyGoal > 0 ? points / child.weeklyGoal : 0;
    return {
      childId: child.id,
      name: child.name,
      avatarIcon: child.avatarIcon,
      goal: child.weeklyGoal,
      points,
      ratio,
    };
  });
}

export function useWeeklyProgress() {
  const progress = ref(buildEntries([]));
  const keys = weekDayKeys(new Date());

  const subscription = liveQuery(() => db.completions.where('date').anyOf(keys).toArray()).subscribe({
    next(rows) {
      progress.value = buildEntries(rows);
    },
    error() {
      progress.value = buildEntries([]);
    },
  });

  onUnmounted(() => subscription.unsubscribe());

  return { progress };
}
