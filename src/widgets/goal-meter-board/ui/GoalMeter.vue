<template>
  <div class="goal-meter">
    <q-avatar
      size="52px"
      color="grey-9"
      class="goal-meter__avatar-slot"
      :class="{ 'goal-meter__editable': editable }"
      @click="edit"
    >
      <img v-if="entry.photo" :src="entry.photo" :alt="entry.name" />
      <MeterFigure v-else :kind="entry.figure" :color="entry.carColor" :size="38" />
    </q-avatar>

    <div class="goal-meter__body">
      <div class="goal-meter__head">
        <span class="goal-meter__name" :class="{ 'goal-meter__editable': editable }" @click="edit">
          {{ entry.name }}
          <q-icon v-if="editable" name="edit" size="16px" color="grey-5" class="q-ml-xs" />
        </span>
        <span
          v-if="isStreakShown(entry.streak)"
          v-ripple
          class="goal-meter__streak"
          role="button"
          tabindex="0"
          :aria-label="`Серия: ${entry.streak}`"
          @click="emit('open-streak')"
          @keyup.enter="emit('open-streak')"
        >
          <span class="goal-meter__flame">🔥</span>
          <span class="goal-meter__streak-count">{{ entry.streak }}</span>
          <span class="goal-meter__streak-label">{{ streakLabel }} подряд</span>
        </span>
        <q-btn
          v-if="entry.pendingChoices > 0"
          unelevated
          rounded
          dense
          no-caps
          color="deep-orange"
          class="goal-meter__choice"
          label="🎁 Выбери подарок"
          @click="emit('choose-gift')"
        />
        <q-space />
        <q-btn flat dense no-caps color="primary" class="goal-meter__score" @click="emit('open-history')">
          <q-icon name="savings" size="18px" />
          <span class="q-ml-xs">{{ entry.balance }}</span>
        </q-btn>
      </div>
      <div class="goal-meter__track">
        <div class="goal-meter__fill" :style="{ width: pct + '%' }"></div>
        <q-icon name="sports_score" size="26px" class="goal-meter__flag" />
        <MeterFigure
          :kind="entry.figure"
          :color="entry.carColor"
          :size="46"
          class="goal-meter__car"
          :style="{ left: carLeft, transform: carTransform }"
        />
      </div>
      <div v-if="entry.goal" class="goal-meter__goal">
        <div class="goal-meter__goal-thumb" :style="{ background: entry.goal.color }">
          <img v-if="entry.goal.photo" :src="entry.goal.photo" :alt="entry.goal.name" />
          <q-icon v-else :name="entry.goal.icon" size="18px" color="white" />
        </div>
        <div class="goal-meter__goal-body">
          <div class="goal-meter__goal-head">
            <span class="ellipsis">Цель: {{ entry.goal.name }}</span>
            <span class="goal-meter__goal-count">{{ entry.goal.saved }} / {{ entry.goal.price }}</span>
          </div>
          <div class="goal-meter__goal-track">
            <div
              class="goal-meter__goal-fill"
              :style="{ width: `${Math.round(entry.goal.ratio * 100)}%`, background: entry.carColor }"
            ></div>
          </div>
        </div>
        <q-btn
          v-if="entry.goal.ready"
          unelevated
          rounded
          dense
          no-caps
          color="positive"
          class="goal-meter__claim"
          label="Получить"
          @click="emit('claim-goal')"
        />
        <q-btn
          v-if="editable"
          flat
          round
          dense
          size="sm"
          icon="close"
          color="grey-6"
          aria-label="Убрать цель"
          @click="emit('remove-goal')"
        />
      </div>
      <button
        v-else-if="editable"
        type="button"
        class="add-tile add-tile--small goal-meter__add-goal"
        @click="emit('add-goal')"
      >
        <q-icon name="add" size="16px" />
        Добавить цель
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { pluralize } from '@/shared/lib/plural';
import MeterFigure from '@/shared/ui/MeterFigure.vue';
import { isStreakShown } from '@/entities/streak';
import { BALL_DEGREES_PER_PERCENT } from './constants';
import type { MeterEntry } from '../model/types';

const props = withDefaults(defineProps<{ entry: MeterEntry; editable?: boolean }>(), {
  editable: false,
});
const emit = defineEmits<{
  'open-history': [];
  'open-streak': [];
  'choose-gift': [];
  'claim-goal': [];
  'add-goal': [];
  'remove-goal': [];
  edit: [];
}>();

const edit = (): void => {
  if (props.editable) {
    emit('edit');
  }
};

const streakLabel = computed(() => pluralize(props.entry.streak, ['день', 'дня', 'дней']));

const pct = computed(() => Math.min(100, Math.round(props.entry.ratio * 100)));
const carLeft = computed(() => `calc(23px + (100% - 46px) * ${pct.value / 100})`);
const carTransform = computed(() =>
  props.entry.figure === 'ball' ? `translate(-50%, -50%) rotate(${pct.value * BALL_DEGREES_PER_PERCENT}deg)` : undefined
);
</script>

<style scoped>
.goal-meter {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
}

.goal-meter__avatar-slot {
  flex: 0 0 auto;
}

.goal-meter__editable {
  cursor: pointer;
}

.goal-meter__body {
  flex: 1 1 auto;
  min-width: 0;
}

.goal-meter__head {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 2px;
  margin-bottom: 10px;
  font-weight: 600;
}

.goal-meter__streak {
  position: relative;
  cursor: pointer;
  user-select: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 10px;
  padding: 2px 10px 2px 6px;
  border-radius: 999px;
  background: rgba(255, 159, 10, 0.16);
}

.goal-meter__flame {
  font-size: 20px;
  line-height: 1;
}

.goal-meter__streak-count {
  font-size: 16px;
  font-weight: 700;
  color: #ff9f0a;
}

.goal-meter__streak-label {
  font-size: 12px;
  font-weight: 500;
  color: #ffb340;
}

.goal-meter__score {
  padding: 0 6px;
  min-height: auto;
}

.goal-meter__track {
  position: relative;
  height: 20px;
  border-radius: 10px;
  background: #fff8e1;
}

.goal-meter__fill {
  position: absolute;
  inset-inline-start: 0;
  top: 0;
  bottom: 0;
  border-radius: 10px;
  background: linear-gradient(90deg, #fdd835, #f57c00);
  transition: width 0.4s ease;
}

.goal-meter__flag {
  position: absolute;
  right: -2px;
  top: 50%;
  transform: translateY(-50%);
  color: #f9a825;
}

.goal-meter__car {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  transition: left 0.4s ease;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.4));
}
.goal-meter__goal {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
}

.goal-meter__goal-thumb {
  flex: 0 0 auto;
  width: 36px;
  height: 36px;
  border-radius: 9px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.goal-meter__goal-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.goal-meter__goal-body {
  flex: 1 1 auto;
  min-width: 0;
}

.goal-meter__goal-head {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 13px;
  color: #c7c7cc;
}

.goal-meter__goal-count {
  flex: 0 0 auto;
  font-weight: 600;
}

.goal-meter__add-goal {
  margin-top: 10px;
}

.goal-meter__goal-track {
  height: 8px;
  border-radius: 4px;
  background: #3a3a3c;
  overflow: hidden;
}

.goal-meter__goal-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.4s ease;
}

.goal-meter__claim {
  flex: 0 0 auto;
  padding: 2px 12px;
  font-weight: 600;
}

.goal-meter__choice {
  margin-left: 10px;
  padding: 2px 12px;
  font-weight: 600;
}
</style>
