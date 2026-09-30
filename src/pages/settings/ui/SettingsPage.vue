<template>
  <q-page class="q-pa-md settings-page">
    <div class="row items-center q-mb-md">
      <q-btn flat round dense icon="arrow_back" aria-label="Назад" @click="back" />
      <div class="text-h6 q-ml-sm">Настройки</div>
    </div>

    <section class="ios-card q-pa-md q-mb-lg">
      <div class="text-subtitle1 text-weight-bold q-mb-md">🔥 Серия</div>
      <StreakStagesCard
        :picked-reward-id="pickedRewardId"
        @changed="recalculateStreaks"
        @create-reward="createReward"
      />
    </section>

    <section class="ios-card q-pa-md q-mb-lg">
      <div class="text-subtitle1 text-weight-bold q-mb-md">⭐ Бонус за все задачи дня</div>
      <BonusCard />
    </section>

    <section class="ios-card q-mb-lg">
      <q-item clickable @click="pinOpen = true">
        <q-item-section avatar><q-icon name="pin" /></q-item-section>
        <q-item-section>Сменить PIN</q-item-section>
        <q-item-section side><q-icon name="chevron_right" /></q-item-section>
      </q-item>
    </section>

    <PinChangeDialog v-model="pinOpen" />
    <RewardEditDialog v-model="rewardEditorOpen" visibility="streak" @created="pickReward" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { ROUTES } from '@/shared/config/constants';
import { useParentSessionStore } from '@/entities/parent-session';
import type { Reward } from '@/entities/reward';
import { StreakStagesCard, BonusCard, PinChangeDialog } from '@/features/edit-settings';
import { RewardEditDialog } from '@/features/edit-reward';
import { recalculateStreaks } from '@/features/track-streak';

const router = useRouter();
const { active } = storeToRefs(useParentSessionStore());

const pinOpen = ref(false);
const rewardEditorOpen = ref(false);
const pickedRewardId = ref<string | null>(null);

const back = (): void => {
  void router.push(ROUTES.home);
};

const createReward = (): void => {
  pickedRewardId.value = null;
  rewardEditorOpen.value = true;
};

const pickReward = (reward: Reward): void => {
  pickedRewardId.value = reward.id;
};

watch(active, (isActive) => {
  if (!isActive) {
    void router.replace(ROUTES.home);
  }
});
</script>

<style scoped>
.settings-page {
  max-width: 720px;
  margin: 0 auto;
}
</style>
