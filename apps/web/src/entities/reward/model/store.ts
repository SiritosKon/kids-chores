import { ref, computed, onScopeDispose } from 'vue';
import { defineStore } from 'pinia';
import { rewardsCatalogue } from '../api/rewardsRepo';
import { variantsCatalogue } from '../api/variantsRepo';
import type { Reward, RewardVariant } from './types';

export const useRewardsStore = defineStore('rewards', () => {
  const items = ref<Reward[]>([]);
  const loaded = ref(false);

  const subscription = rewardsCatalogue.watch((rows) => {
    items.value = rows;
    loaded.value = true;
  });
  const variants = ref<RewardVariant[]>([]);
  const variantsSubscription = variantsCatalogue.watch((rows) => {
    variants.value = rows.filter((variant) => variant.active);
  });

  onScopeDispose(() => {
    subscription.unsubscribe();
    variantsSubscription.unsubscribe();
  });

  const active = computed(() =>
    items.value
      .filter((reward) => reward.active)
      .sort((first, second) => first.points - second.points)
  );

  const shop = computed(() => active.value.filter((reward) => reward.visibility === 'shop'));

  const byId = (rewardId: string): Reward | undefined =>
    items.value.find((reward) => reward.id === rewardId);

  const nameOf = (rewardId: string): string => byId(rewardId)?.name ?? rewardId;

  const variantsOf = (rewardId: string): RewardVariant[] =>
    variants.value.filter((variant) => variant.rewardId === rewardId);

  const hasVariants = (rewardId: string): boolean =>
    variants.value.some((variant) => variant.rewardId === rewardId);

  return { items, active, shop, loaded, byId, nameOf, variants, variantsOf, hasVariants };
});
