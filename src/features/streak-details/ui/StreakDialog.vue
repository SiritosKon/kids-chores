<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <q-card>
      <q-card-section class="row items-center">
        <div class="text-h6">Серия · {{ childName }}</div>
        <q-space />
        <q-btn flat round dense icon="close" v-close-popup aria-label="Закрыть" />
      </q-card-section>
      <q-separator />

      <q-card-section class="streak-head">
        <div class="streak-flame">🔥</div>
        <div>
          <div class="streak-count">{{ current }}</div>
          <div class="streak-caption">{{ daysLabel }} подряд</div>
        </div>
        <q-space />
        <div v-if="best > 0" class="streak-best">
          <div class="streak-best__value">{{ best }}</div>
          <div class="streak-caption">рекорд</div>
        </div>
      </q-card-section>

      <q-card-section v-if="progress" class="q-pt-none">
        <div class="streak-track">
          <div class="streak-track__fill" :style="{ width: `${Math.round(progress.ratio * 100)}%` }"></div>
        </div>
        <div class="streak-remaining">
          ещё {{ progress.remaining }} {{ remainingLabel }} до награды
        </div>
      </q-card-section>

      <q-separator />
      <q-item-label header>Награда за серию</q-item-label>
      <q-card-section class="q-pa-none">
        <q-list separator>
          <q-item v-for="milestone in milestones" :key="milestone.id">
            <q-item-section avatar>
              <div class="streak-tile" :style="{ background: milestoneColor(milestone) }">
                <q-icon :name="rewardIcon(milestone.rewardId)" size="20px" color="white" />
              </div>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ rewardLabel(milestone) }}</q-item-label>
              <q-item-label caption>
                каждые {{ milestone.days }} {{ pluralize(milestone.days, DAYS) }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-section v-if="current === 0" class="text-grey-5">
        Серия начнётся, как только все задачи дня будут выполнены.
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { pluralize } from '@/shared/lib/plural';
import { useChildrenStore } from '@/entities/child';
import { useRewardsStore, rewardColor } from '@/entities/reward';
import { useSettingsStore, type StreakMilestone } from '@/entities/settings';
import { useStreakStore, streakProgress } from '@/entities/streak';

const props = withDefaults(
  defineProps<{
    modelValue?: boolean;
    childId?: string | null;
  }>(),
  { modelValue: false, childId: null }
);
const emit = defineEmits<{ 'update:modelValue': [open: boolean] }>();

const DAYS = ['день', 'дня', 'дней'] as const;

const childrenStore = useChildrenStore();
const rewardsStore = useRewardsStore();
const settingsStore = useSettingsStore();
const streakStore = useStreakStore();

const childName = computed(() => (props.childId ? childrenStore.nameOf(props.childId) : ''));

const state = computed(() =>
  props.childId ? streakStore.items.find((row) => row.childId === props.childId) : undefined
);

const current = computed(() => state.value?.current ?? 0);
const best = computed(() => state.value?.best ?? 0);
const milestones = computed(() => settingsStore.settings.streak.milestones);
const progress = computed(() => streakProgress(current.value, milestones.value));

const daysLabel = computed(() => pluralize(current.value, DAYS));
const remainingLabel = computed(() => pluralize(progress.value?.remaining ?? 0, DAYS));

const rewardIcon = (rewardId: string | undefined): string =>
  (rewardId ? rewardsStore.byId(rewardId)?.icon : undefined) ?? 'star';

const milestoneColor = (milestone: StreakMilestone): string => {
  const reward = milestone.rewardId ? rewardsStore.byId(milestone.rewardId) : undefined;
  return reward ? rewardColor(reward) : '#FF9F0A';
};

const rewardLabel = (milestone: StreakMilestone): string => {
  if (milestone.rewardId) {
    return rewardsStore.nameOf(milestone.rewardId);
  }
  return milestone.points ? `${milestone.points} б.` : 'Без награды';
};
</script>

<style scoped>
.streak-head {
  display: flex;
  align-items: center;
  gap: 14px;
}

.streak-flame {
  font-size: 44px;
  line-height: 1;
}

.streak-count {
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
  color: #ff9f0a;
}

.streak-caption {
  font-size: 12px;
  color: #8e8e93;
}

.streak-best {
  text-align: right;
}

.streak-best__value {
  font-size: 20px;
  font-weight: 600;
}

.streak-track {
  position: relative;
  height: 14px;
  border-radius: 7px;
  background: #fff8e1;
  overflow: hidden;
}

.streak-track__fill {
  position: absolute;
  inset-inline-start: 0;
  top: 0;
  bottom: 0;
  border-radius: 7px;
  background: linear-gradient(90deg, #fdd835, #f57c00);
  transition: width 0.4s ease;
}

.streak-remaining {
  margin-top: 8px;
  font-size: 13px;
  color: #8e8e93;
}

.streak-tile {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
