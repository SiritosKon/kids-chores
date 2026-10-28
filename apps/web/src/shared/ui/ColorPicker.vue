<template>
  <div class="color-picker" role="radiogroup">
    <button
      v-for="color in COLOR_PALETTE"
      :key="color"
      type="button"
      role="radio"
      class="color-picker__swatch"
      :class="{ 'color-picker__swatch--active': color === modelValue }"
      :style="{ background: color }"
      :aria-checked="color === modelValue"
      :aria-label="color"
      @click="emit('update:modelValue', color)"
    >
      <q-icon v-if="color === modelValue" name="check" size="18px" color="white" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { COLOR_PALETTE } from './constants';

defineProps<{ modelValue: string }>();
const emit = defineEmits<{ 'update:modelValue': [color: string] }>();
</script>

<style scoped>
.color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.color-picker__swatch {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 2px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}

.color-picker__swatch--active {
  border-color: #ffffff;
}
</style>
