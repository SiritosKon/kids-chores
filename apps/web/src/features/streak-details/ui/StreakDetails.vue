<template>
  <section class="ios-card">
    <q-card-section class="streak-head">
      <div class="streak-flame">🔥</div>
      <div>
        <div class="streak-count">{{ current }}</div>
        <div class="streak-caption">{{ t('streakDetails.inRow', current) }}</div>
      </div>
      <q-space />
      <div v-if="best > 0" class="streak-best">
        <div class="streak-best__value">{{ best }}</div>
        <div class="streak-caption">{{ t('streakDetails.best') }}</div>
      </div>
    </q-card-section>

    <q-card-section v-if="progress" class="q-pt-none">
      <div class="streak-track">
        <div class="streak-track__fill" :style="{ width: `${Math.round(progress.ratio * 100)}%` }"></div>
      </div>
      <div class="streak-progress-row">
        <span class="streak-remaining">
          {{ t('streakDetails.remaining', { target: progressTarget }, progress.remaining) }}
        </span>
        <span class="streak-fraction">{{ progress.achieved }} / {{ progress.days }}</span>
      </div>
    </q-card-section>
    <q-card-section v-else-if="milestones.length > 0 && current > 0" class="q-pt-none streak-remaining">
      {{ t('streakDetails.allDone') }}
    </q-card-section>

    <q-separator />
    <q-item-label header>{{ t('streakDetails.stages') }}</q-item-label>
    <q-card-section class="q-pa-none q-pb-sm">
      <q-list separator>
        <q-item
          v-for="milestone in milestones"
          :key="milestone.id"
          :class="{ 'streak-stage--next': milestone.id === progress?.milestoneId }"
        >
          <q-item-section avatar>
            <div class="streak-tile" :style="{ background: milestoneColor(milestone) }">
              <q-icon :name="rewardIcon(milestone.rewardId)" size="20px" color="white" />
            </div>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ rewardLabel(milestone) }}</q-item-label>
            <q-item-label caption>
              {{ t('streakDetails.daysInRow', milestone.days) }}
            </q-item-label>
          </q-item-section>
          <q-item-section v-if="isStageReached(current, milestone)" side>
            <q-icon name="check_circle" color="positive" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>

    <q-card-section v-if="current === 0" class="text-grey-5">
      {{ t('streakDetails.notStarted') }}
    </q-card-section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRewardsStore, rewardColor } from '@/entities/reward';
import { useSettingsStore, openMilestones, milestonesFor } from '@/entities/settings';
import { useStreakStore, streakProgress, isStageReached, type StreakMilestoneInput } from '@/entities/streak';
import { useParentSessionStore } from '@/entities/parent-session';
import { SURPRISE } from './constants';

const props = defineProps<{ childId: string }>();

const { t } = useI18n();
const rewardsStore = useRewardsStore();
const settingsStore = useSettingsStore();
const streakStore = useStreakStore();
const parentSession = useParentSessionStore();

const state = computed(() => streakStore.items.find((row) => row.childId === props.childId));

const current = computed(() => state.value?.current ?? 0);
const best = computed(() => state.value?.best ?? 0);
const milestones = computed(() => openMilestones(milestonesFor(settingsStore.streak.milestones, props.childId)));
const progress = computed(() => streakProgress(current.value, milestones.value));

const isSurprise = (rewardId: string | undefined): boolean =>
  rewardId !== undefined && rewardsStore.byId(rewardId)?.visibility === 'hidden';

const hidesSurprise = (rewardId: string | undefined): boolean => isSurprise(rewardId) && !parentSession.active;

const rewardIcon = (rewardId: string | undefined): string => {
  if (hidesSurprise(rewardId)) {
    return SURPRISE.icon;
  }
  return (rewardId ? rewardsStore.byId(rewardId)?.icon : undefined) ?? 'star';
};

const milestoneColor = (milestone: StreakMilestoneInput): string => {
  if (hidesSurprise(milestone.rewardId)) {
    return SURPRISE.color;
  }
  const reward = milestone.rewardId ? rewardsStore.byId(milestone.rewardId) : undefined;
  return reward ? rewardColor(reward) : '#FF9F0A';
};

const rewardLabel = (milestone: Pick<StreakMilestoneInput, 'rewardId' | 'points'>): string => {
  if (hidesSurprise(milestone.rewardId)) {
    return t(SURPRISE.label);
  }
  if (milestone.rewardId) {
    const name = rewardsStore.nameOf(milestone.rewardId);
    return isSurprise(milestone.rewardId) ? `${name} · ${t(SURPRISE.label).toLowerCase()}` : name;
  }
  return milestone.points ? t('common.pointsShort', milestone.points) : t('streakDetails.noReward');
};

const progressTarget = computed(() => {
  if (!progress.value) {
    return '';
  }
  return hidesSurprise(progress.value.rewardId)
    ? t('streakDetails.surpriseTarget')
    : t('streakDetails.quoted', { label: rewardLabel(progress.value) });
});
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

.streak-progress-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-top: 8px;
}

.streak-remaining {
  font-size: 13px;
  color: #8e8e93;
}

.streak-fraction {
  font-size: 13px;
  font-weight: 600;
  color: #ffb340;
}

.streak-stage--next {
  background: rgba(255, 159, 10, 0.12);
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
