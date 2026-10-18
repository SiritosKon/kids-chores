<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <q-card class="dialog--wide">
      <q-card-section class="award-head">
        <div class="award-trophy">🏆</div>
        <div class="text-h5 text-weight-bold">{{ t('celebrateStreak.title') }}</div>
        <div class="award-caption">{{ headline }}</div>
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
                {{ t('celebrateStreak.daysInRow', award.days) }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions class="q-px-md q-pt-md q-pb-md">
        <q-btn
          v-close-popup
          unelevated
          rounded
          no-caps
          color="primary"
          :label="t('celebrateStreak.hooray')"
          class="award-button text-weight-bold"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
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

const { t } = useI18n();
const childrenStore = useChildrenStore();
const rewardsStore = useRewardsStore();

const headline = computed(() => {
  const names = [...new Set(props.awards.map((award) => childrenStore.nameOf(award.childId)))];
  return names.length === 1 ? t('celebrateStreak.oneChild', { name: names[0] }) : t('celebrateStreak.manyChildren');
});

const awardTitle = (award: StreakAward): string => {
  if (award.rewardId) {
    return rewardsStore.nameOf(award.rewardId);
  }
  return award.points ? `+${t('common.pointsShort', award.points)}` : t('celebrateStreak.reward');
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
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 6px;
  padding-top: 28px;
}

.award-trophy {
  font-size: 84px;
  line-height: 1;
}

.award-caption {
  font-size: 14px;
  color: #8e8e93;
}

.award-button {
  flex: 1 1 auto;
  min-height: 52px;
  font-size: 17px;
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
