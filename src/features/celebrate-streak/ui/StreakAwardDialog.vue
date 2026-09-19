<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <q-card class="dialog--wide">
      <q-card-section class="award-head">
        <div class="award-flame">🔥</div>
        <div>
          <div class="text-h6">Серия!</div>
          <div class="award-caption">{{ headline }}</div>
        </div>
      </q-card-section>
      <q-separator />

      <q-card-section class="q-pa-none q-pb-sm">
        <q-list separator>
          <q-item v-for="award in awards" :key="award.id">
            <q-item-section avatar>
              <div class="award-tile" :style="{ background: awardColor(award) }">
                <q-icon :name="awardIcon(award)" size="20px" color="white" />
              </div>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ awardTitle(award) }}</q-item-label>
              <q-item-label caption>
                {{ childrenStore.nameOf(award.childId) }} ·
                {{ award.days }} {{ pluralize(award.days, DAYS) }} подряд
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn unelevated color="primary" label="Ура!" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { pluralize } from '@/shared/lib/plural';
import { useChildrenStore } from '@/entities/child';
import { useRewardsStore, rewardColor } from '@/entities/reward';
import type { StreakAward } from '@/features/track-streak';

const props = withDefaults(
  defineProps<{
    modelValue?: boolean;
    awards?: StreakAward[];
  }>(),
  { modelValue: false, awards: () => [] }
);
const emit = defineEmits<{ 'update:modelValue': [open: boolean] }>();

const DAYS = ['день', 'дня', 'дней'] as const;

const childrenStore = useChildrenStore();
const rewardsStore = useRewardsStore();

const headline = computed(() => {
  const names = [...new Set(props.awards.map((award) => childrenStore.nameOf(award.childId)))];
  return names.length === 1 ? `${names[0]} заработал награду` : 'Награды заработаны';
});

const awardTitle = (award: StreakAward): string => {
  if (award.rewardId) {
    return rewardsStore.nameOf(award.rewardId);
  }
  return award.points ? `+${award.points} б.` : 'Награда';
};

const awardIcon = (award: StreakAward): string =>
  (award.rewardId ? rewardsStore.byId(award.rewardId)?.icon : undefined) ?? 'star';

const awardColor = (award: StreakAward): string => {
  const reward = award.rewardId ? rewardsStore.byId(award.rewardId) : undefined;
  return reward ? rewardColor(reward) : '#FF9F0A';
};
</script>

<style scoped>
.award-head {
  display: flex;
  align-items: center;
  gap: 14px;
}

.award-flame {
  font-size: 44px;
  line-height: 1;
}

.award-caption {
  font-size: 13px;
  color: #8e8e93;
}

.award-tile {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
