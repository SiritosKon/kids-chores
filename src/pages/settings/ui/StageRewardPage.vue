<template>
  <q-page class="q-pa-md settings-page">
    <SettingsHeader title="Новая награда" :back-to="backTo" />
    <section class="ios-card q-pa-md">
      <RewardEditForm visibility="streak" @created="pick" @cancel="back(null)" />
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { NEW_STAGE_ID } from '@/shared/config/constants';
import { stagePath } from '@/shared/lib/routes';
import { useGoBack } from '@/shared/lib/useGoBack';
import type { Reward } from '@/entities/reward';
import { useStageDraftStore } from '@/features/edit-settings';
import { RewardEditForm } from '@/features/edit-reward';
import SettingsHeader from './SettingsHeader.vue';

const route = useRoute();
const goBack = useGoBack();
const draftStore = useStageDraftStore();

const backTo = computed(() => stagePath(String(route.params.stageId ?? NEW_STAGE_ID)));

const back = (rewardId: string | null): void => {
  draftStore.returnWithReward(rewardId);
  goBack(backTo.value);
};

const pick = (reward: Reward): void => {
  back(reward.id);
};
</script>
