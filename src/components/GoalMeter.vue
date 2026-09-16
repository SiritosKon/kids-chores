<template>
  <div class="goal-meter">
    <div class="goal-meter__head">
      <span class="goal-meter__name">{{ entry.name }}</span>
      <span class="goal-meter__score">{{ entry.points }} / {{ entry.goal }}</span>
    </div>
    <div class="goal-meter__track">
      <div class="goal-meter__fill" :style="{ width: pct + '%' }"></div>
      <q-icon name="sports_score" size="26px" class="goal-meter__flag" />
      <q-icon :name="iconName" size="34px" class="goal-meter__avatar" :style="{ left: pct + '%' }" />
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
.goal-meter__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 6px;
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
  overflow: visible;
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
  right: -4px;
  top: 50%;
  transform: translateY(-50%);
  color: #f9a825;
}

.goal-meter__avatar {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  color: #1a1a1a;
  transition: left 0.4s ease;
}
</style>
