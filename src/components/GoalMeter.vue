<template>
  <div class="goal-meter">
    <q-avatar size="52px" color="grey-9" text-color="orange" class="goal-meter__avatar-slot">
      <q-icon :name="iconName" size="30px" />
    </q-avatar>

    <div class="goal-meter__body">
      <div class="goal-meter__head">
        <span class="goal-meter__name">{{ entry.name }}</span>
        <span class="goal-meter__score">{{ entry.points }} / {{ entry.goal }}</span>
      </div>
      <div class="goal-meter__track">
        <div class="goal-meter__fill" :style="{ width: pct + '%' }"></div>
        <q-icon name="sports_score" size="26px" class="goal-meter__flag" />
        <q-icon :name="iconName" size="30px" class="goal-meter__car" :style="{ left: pct + '%' }" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  entry: { type: Object, required: true },
});

const ICONS = {
  car: 'directions_car',
  rocket: 'rocket_launch',
  star: 'star',
};

const iconName = computed(() => ICONS[props.entry.avatarIcon] || ICONS.car);
const pct = computed(() => Math.min(100, Math.round((props.entry.ratio || 0) * 100)));
</script>

<style scoped>
.goal-meter {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 14px;
  background: #2e2e2e;
}

.goal-meter__avatar-slot {
  flex: 0 0 auto;
}

.goal-meter__body {
  flex: 1 1 auto;
  min-width: 0;
}

.goal-meter__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 10px;
  font-weight: 600;
}

.goal-meter__score {
  color: var(--q-primary);
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
  color: #1a1a1a;
  transition: left 0.4s ease;
}
</style>
