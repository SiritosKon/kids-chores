import { ref, onUnmounted } from 'vue';
import { liveQuery } from 'dexie';
import { db } from '../db/db.js';
import { CHILDREN } from '../config/children.js';

function buildTotals(rows) {
  const totals = {};
  for (const child of CHILDREN) {
    totals[child.id] = 0;
  }
  for (const row of rows) {
    if (totals[row.childId] !== undefined) {
      totals[row.childId] += row.points;
    }
  }
  return totals;
}

export function useAllTimeTotals() {
  const totals = ref(buildTotals([]));

  const subscription = liveQuery(() => db.completions.toArray()).subscribe({
    next(rows) {
      totals.value = buildTotals(rows);
    },
    error() {
      totals.value = buildTotals([]);
    },
  });

  onUnmounted(() => subscription.unsubscribe());

  return { totals };
}
