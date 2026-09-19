import { ref, computed } from 'vue';
import { liveQuery } from 'dexie';
import { db } from '@/shared/api/db';
import { CHILDREN } from '../config/children.js';

const PIGGY_STEP = 50;

function emptyMap() {
  const map = {};
  for (const child of CHILDREN) {
    map[child.id] = 0;
  }
  return map;
}

const balances = ref(emptyMap());

liveQuery(async () => {
  const [completions, spends] = await Promise.all([db.completions.toArray(), db.spends.toArray()]);
  return { completions, spends };
}).subscribe({
  next({ completions, spends }) {
    const map = emptyMap();
    for (const row of completions) {
      if (map[row.childId] !== undefined) {
        map[row.childId] += row.points;
      }
    }
    for (const spend of spends) {
      if (map[spend.childId] !== undefined) {
        map[spend.childId] -= spend.cost;
      }
    }
    balances.value = map;
  },
  error() {
    balances.value = emptyMap();
  },
});

export function piggyMax(balance) {
  if (balance <= PIGGY_STEP) {
    return PIGGY_STEP;
  }
  return Math.ceil(balance / PIGGY_STEP) * PIGGY_STEP;
}

const meterEntries = computed(() =>
  CHILDREN.map((child) => {
    const balance = balances.value[child.id] || 0;
    const max = piggyMax(balance);
    return {
      childId: child.id,
      name: child.name,
      photo: child.photo,
      carColor: child.carColor,
      balance,
      ratio: max > 0 ? balance / max : 0,
    };
  })
);

export function useBalances() {
  return { balances, meterEntries };
}
