import { ref, onScopeDispose } from 'vue';
import { liveQuery } from 'dexie';
import { defineStore } from 'pinia';
import { completionsTable } from '@/entities/completion/@x/wallet';
import { spendsTable } from '@/entities/spend/@x/wallet';

export type Balances = Readonly<Record<string, number>>;

export const useWalletStore = defineStore('wallet', () => {
  const balances = ref<Balances>({});

  const subscription = liveQuery(async () => {
    const [completions, spends] = await Promise.all([
      completionsTable.toArray(),
      spendsTable.toArray(),
    ]);
    return { completions, spends };
  }).subscribe({
    next({ completions, spends }) {
      const next: Record<string, number> = {};
      for (const row of completions) {
        next[row.childId] = (next[row.childId] ?? 0) + row.points;
      }
      for (const spend of spends) {
        next[spend.childId] = (next[spend.childId] ?? 0) - spend.cost;
      }
      balances.value = next;
    },
    error() {
      balances.value = {};
    },
  });

  onScopeDispose(() => subscription.unsubscribe());

  const balanceOf = (childId: string): number => {
    return balances.value[childId] ?? 0;
  };

  return { balances, balanceOf };
});
