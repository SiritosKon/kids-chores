import { ref, computed, onScopeDispose } from 'vue';
import { defineStore } from 'pinia';
import { rewardsCatalogue } from '../api/rewardsRepo';
import type { Reward } from './schema';

export const useRewardsStore = defineStore('rewards', () => {
  const items = ref<Reward[]>([]);
  const loaded = ref(false);

  const subscription = rewardsCatalogue.watch((rows) => {
    items.value = rows;
    loaded.value = true;
  });
  onScopeDispose(() => subscription.unsubscribe());

  const active = computed(() =>
    items.value.filter((reward) => reward.active).sort((first, second) => first.points - second.points)
  );

  const byId = (rewardId: string): Reward | undefined =>
    items.value.find((reward) => reward.id === rewardId);

  const nameOf = (rewardId: string): string => byId(rewardId)?.name ?? rewardId;

  return { items, active, loaded, byId, nameOf };
});
