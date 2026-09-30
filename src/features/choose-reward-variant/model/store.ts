import { ref, computed, onScopeDispose } from 'vue';
import { defineStore } from 'pinia';
import { useRewardsStore } from '@/entities/reward';
import { watchSpends, type Spend } from '@/entities/spend';

export const usePendingChoicesStore = defineStore('pending-choices', () => {
  const rewardsStore = useRewardsStore();
  const spends = ref<Spend[]>([]);

  const subscription = watchSpends((rows) => {
    spends.value = rows;
  });
  onScopeDispose(() => subscription.unsubscribe());

  const pending = computed(() =>
    spends.value.filter((spend) => spend.variantId === undefined && rewardsStore.hasVariants(spend.rewardId))
  );

  const pendingOf = (childId: string): Spend[] => pending.value.filter((spend) => spend.childId === childId);

  return { pending, pendingOf };
});
