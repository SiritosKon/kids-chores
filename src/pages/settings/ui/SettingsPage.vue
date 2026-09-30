<template>
  <q-page class="q-pa-md settings-page">
    <PageHeader title="Настройки" :back-to="ROUTES.home" />

    <section class="ios-card q-pa-md q-mb-lg">
      <div class="text-subtitle1 text-weight-bold q-mb-md">🔥 Серия</div>
      <StreakStagesCard @changed="recalculateStreaks" @open-stage="openStage" />
    </section>

    <section class="ios-card q-pa-md q-mb-lg">
      <div class="text-subtitle1 text-weight-bold q-mb-md">⭐ Бонус за все задачи дня</div>
      <BonusCard />
    </section>

    <section class="ios-card q-mb-lg">
      <q-item clickable @click="router.push(ROUTES.settingsPin)">
        <q-item-section avatar><q-icon name="pin" /></q-item-section>
        <q-item-section>Сменить PIN</q-item-section>
        <q-item-section side><q-icon name="chevron_right" /></q-item-section>
      </q-item>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ROUTES, NEW_STAGE_ID } from '@/shared/config/constants';
import { stagePath } from '@/shared/lib/routes';
import PageHeader from '@/shared/ui/PageHeader.vue';
import { StreakStagesCard, BonusCard } from '@/features/edit-settings';
import { recalculateStreaks } from '@/features/track-streak';

const router = useRouter();

const openStage = (stageId: string | null): void => {
  void router.push(stagePath(stageId ?? NEW_STAGE_ID));
};
</script>
