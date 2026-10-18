<template>
  <div class="form-stack">
    <q-toggle
      :model-value="settingsStore.streak.enabled"
      :label="t('editSettings.streakToggle')"
      color="primary"
      @update:model-value="toggle"
    />
    <div v-if="settingsStore.streak.enabled">
      <div class="text-caption text-grey-5 q-mb-sm">
        {{ t('editSettings.streakHelp') }}
      </div>
      <q-list separator class="stages">
        <q-item v-for="stage in stages" :key="stage.id" clickable @click="emit('open-stage', stage.id)">
          <q-item-section avatar>
            <div class="stage-days">{{ stage.days }}</div>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ prizeLabel(stage) }}</q-item-label>
            <q-item-label caption>
              {{ t('editSettings.stageDaysInRow', stage.days) }} · {{ childrenLabel(stage) }}
            </q-item-label>
          </q-item-section>
          <q-item-section side><q-icon name="chevron_right" /></q-item-section>
        </q-item>
      </q-list>
      <q-btn flat no-caps color="primary" icon="add" :label="t('editSettings.addStage')" class="q-mt-sm" @click="emit('open-stage', null)" />
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useChildrenStore } from '@/entities/child';
import { useRewardsStore } from '@/entities/reward';
import { useSettingsStore, openMilestones, type StreakMilestone } from '@/entities/settings';

const emit = defineEmits<{ changed: []; 'open-stage': [stageId: string | null] }>();

const { t } = useI18n();
const settingsStore = useSettingsStore();
const rewardsStore = useRewardsStore();
const childrenStore = useChildrenStore();

const stages = computed(() => openMilestones(settingsStore.streak.milestones));

const prizeLabel = (stage: StreakMilestone): string =>
  [stage.rewardId ? rewardsStore.nameOf(stage.rewardId) : '', stage.points ? t('common.pointsShort', stage.points) : '']
    .filter(Boolean)
    .join(' + ');

const childrenLabel = (stage: StreakMilestone): string =>
  stage.childIds ? stage.childIds.map((childId) => childrenStore.nameOf(childId)).join(', ') : t('editSettings.allChildren');

const toggle = async (enabled: boolean): Promise<void> => {
  await settingsStore.update({ streak: { ...settingsStore.streak, enabled } });
  emit('changed');
};
</script>

<style scoped>
.stages {
  border-radius: 12px;
  background: #2c2c2e;
}

.stage-days {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #000;
  background: #ff9f0a;
}
</style>
