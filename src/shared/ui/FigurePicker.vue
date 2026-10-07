<template>
  <div class="figure-picker" role="radiogroup">
    <button
      v-for="figure in METER_FIGURES"
      :key="figure"
      type="button"
      role="radio"
      class="figure-picker__tile"
      :class="{ 'figure-picker__tile--active': figure === modelValue }"
      :aria-checked="figure === modelValue"
      :aria-label="METER_FIGURE_LABELS[figure]"
      @click="emit('update:modelValue', figure)"
    >
      <MeterFigure :kind="figure" :color="color" :size="44" />
      <span class="figure-picker__label">{{ METER_FIGURE_LABELS[figure] }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import MeterFigure from './MeterFigure.vue';
import { METER_FIGURES, METER_FIGURE_LABELS } from './constants';
import type { MeterFigureKind } from './types';

defineProps<{ modelValue: MeterFigureKind; color: string }>();
const emit = defineEmits<{ 'update:modelValue': [figure: MeterFigureKind] }>();
</script>

<style scoped>
.figure-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.figure-picker__tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 76px;
  padding: 8px 4px 6px;
  border-radius: 12px;
  border: 2px solid transparent;
  background: #fff8e1;
  cursor: pointer;
}

.figure-picker__tile--active {
  border-color: #ff9f0a;
}

.figure-picker__label {
  font-size: 11px;
  font-weight: 600;
  color: #3a3a3c;
}
</style>
