<template>
  <q-page class="q-pa-md settings-page">
    <PageHeader title="Новая награда" :back-to="backTo" />
    <section class="ios-card q-pa-md">
      <RewardEditForm visibility="goal" @created="pick" @cancel="back(null)" />
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { NEW_CHILD_ID } from '@/shared/config/constants';
import { childPath } from '@/shared/lib/routes';
import { useGoBack } from '@/shared/lib/useGoBack';
import PageHeader from '@/shared/ui/PageHeader.vue';
import type { Reward } from '@/entities/reward';
import { useChildFormStore } from '@/features/edit-child';
import { RewardEditForm } from '@/features/edit-reward';

const route = useRoute();
const goBack = useGoBack();
const formStore = useChildFormStore();

const backTo = computed(() => childPath(String(route.params.childId ?? NEW_CHILD_ID)));

const back = (rewardId: string | null): void => {
  formStore.returnWithReward(rewardId);
  goBack(backTo.value);
};

const pick = (reward: Reward): void => {
  back(reward.id);
};
</script>
