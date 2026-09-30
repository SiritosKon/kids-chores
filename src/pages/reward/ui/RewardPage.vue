<template>
  <q-page class="q-pa-md settings-page">
    <PageHeader :title="reward ? 'Награда' : 'Новая награда'" :back-to="ROUTES.home" />
    <section v-if="rewardsStore.loaded" class="ios-card q-pa-md">
      <RewardEditForm :key="rewardId" :reward="reward" @done="close" @cancel="close" />
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ROUTES, NEW_REWARD_ID } from '@/shared/config/constants';
import { useGoBack } from '@/shared/lib/useGoBack';
import PageHeader from '@/shared/ui/PageHeader.vue';
import { useRewardsStore } from '@/entities/reward';
import { RewardEditForm } from '@/features/edit-reward';

const route = useRoute();
const router = useRouter();
const goBack = useGoBack();
const rewardsStore = useRewardsStore();

const rewardId = computed(() => String(route.params.rewardId ?? NEW_REWARD_ID));

const reward = computed(() =>
  rewardId.value === NEW_REWARD_ID ? null : (rewardsStore.byId(rewardId.value) ?? null)
);

watch(
  () => rewardsStore.loaded,
  (loaded) => {
    if (loaded && rewardId.value !== NEW_REWARD_ID && !reward.value?.active) {
      void router.replace(ROUTES.home);
    }
  },
  { immediate: true }
);

const close = (): void => {
  goBack(ROUTES.home);
};
</script>
