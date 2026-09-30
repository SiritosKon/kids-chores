<template>
  <q-page class="q-pa-md settings-page">
    <PageHeader :title="stage ? 'Этап серии' : 'Новый этап'" :back-to="ROUTES.settings" />
    <section class="ios-card q-pa-md">
      <StreakStageForm :stage="stage" @changed="onChanged" @create-reward="createReward" />
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ROUTES, NEW_STAGE_ID } from '@/shared/config/constants';
import { stageRewardPath } from '@/shared/lib/routes';
import { useGoBack } from '@/shared/lib/useGoBack';
import PageHeader from '@/shared/ui/PageHeader.vue';
import { useSettingsStore, openMilestones } from '@/entities/settings';
import { StreakStageForm, useStageDraftStore } from '@/features/edit-settings';
import { recalculateStreaks } from '@/features/track-streak';

const route = useRoute();
const router = useRouter();
const goBack = useGoBack();
const settingsStore = useSettingsStore();
const draftStore = useStageDraftStore();

const stageId = computed(() => String(route.params.stageId ?? NEW_STAGE_ID));

const stage = computed(
  () => openMilestones(settingsStore.streak.milestones).find((milestone) => milestone.id === stageId.value) ?? null
);

onMounted(() => {
  if (stageId.value !== NEW_STAGE_ID && !stage.value) {
    void router.replace(ROUTES.settings);
    return;
  }
  draftStore.begin(stageId.value, stage.value);
});

const onChanged = async (): Promise<void> => {
  await recalculateStreaks();
  goBack(ROUTES.settings);
};

const createReward = (): void => {
  void router.push(stageRewardPath(stageId.value));
};
</script>
