<template>
  <div class="form-stack">
    <q-toggle
      :model-value="settingsStore.streak.enabled"
      label="Награждать за дни подряд"
      color="primary"
      data-tour="settings-streak-toggle"
      @update:model-value="toggle"
    />
    <div v-if="settingsStore.streak.enabled" data-tour="settings-streak">
      <div class="text-caption text-grey-5 q-mb-sm">
        Каждый этап срабатывает один раз за серию. Серия прервалась — этапы можно пройти заново.
      </div>
      <q-list separator class="stages">
        <q-item v-for="stage in stages" :key="stage.id" clickable @click="edit(stage)">
          <q-item-section avatar>
            <div class="stage-days">{{ stage.days }}</div>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ prizeLabel(stage) }}</q-item-label>
            <q-item-label caption>
              {{ stage.days }} {{ pluralize(stage.days, DAY_WORD_FORMS) }} подряд · {{ childrenLabel(stage) }}
            </q-item-label>
          </q-item-section>
          <q-item-section side><q-icon name="chevron_right" /></q-item-section>
        </q-item>
      </q-list>
      <q-btn flat no-caps color="primary" icon="add" label="Добавить этап" class="q-mt-sm" @click="edit(null)" />
    </div>

    <StreakStageDialog
      v-model="dialogOpen"
      :stage="editing"
      :picked-reward-id="pickedRewardId"
      @changed="emit('changed')"
      @create-reward="emit('create-reward')"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { DAY_WORD_FORMS } from '@/shared/lib/constants';
import { pluralize } from '@/shared/lib/plural';
import { useChildrenStore } from '@/entities/child';
import { useRewardsStore } from '@/entities/reward';
import { useSettingsStore, openMilestones, type StreakMilestone } from '@/entities/settings';
import StreakStageDialog from './StreakStageDialog.vue';

withDefaults(defineProps<{ pickedRewardId?: string | null }>(), { pickedRewardId: null });
const emit = defineEmits<{ changed: []; 'create-reward': [] }>();

const settingsStore = useSettingsStore();
const rewardsStore = useRewardsStore();
const childrenStore = useChildrenStore();

const dialogOpen = ref(false);
const editing = ref<StreakMilestone | null>(null);

const stages = computed(() => openMilestones(settingsStore.streak.milestones));

const prizeLabel = (stage: StreakMilestone): string =>
  [stage.rewardId ? rewardsStore.nameOf(stage.rewardId) : '', stage.points ? `${stage.points} б.` : '']
    .filter(Boolean)
    .join(' + ');

const childrenLabel = (stage: StreakMilestone): string =>
  stage.childIds ? stage.childIds.map((childId) => childrenStore.nameOf(childId)).join(', ') : 'все дети';

const toggle = async (enabled: boolean): Promise<void> => {
  await settingsStore.update({ streak: { ...settingsStore.streak, enabled } });
  emit('changed');
};

const edit = (stage: StreakMilestone | null): void => {
  editing.value = stage;
  dialogOpen.value = true;
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
