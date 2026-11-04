<template>
  <div class="icon-picker" role="radiogroup">
    <button
      v-for="icon in ICON_CHOICES"
      :key="icon"
      type="button"
      role="radio"
      class="icon-picker__option"
      :class="{ 'icon-picker__option--active': icon === modelValue }"
      :style="icon === modelValue ? { background: color } : undefined"
      :aria-checked="icon === modelValue"
      :aria-label="icon"
      @click="emit('update:modelValue', icon)"
    >
      <q-icon :name="icon" size="22px" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ICON_CHOICES } from './constants';

withDefaults(defineProps<{ modelValue: string; color?: string }>(), { color: '#FF9F0A' });
const emit = defineEmits<{ 'update:modelValue': [icon: string] }>();
</script>

<style scoped>
.icon-picker {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: 6px;
  max-height: 180px;
  overflow-y: auto;
}

.icon-picker__option {
  height: 40px;
  border-radius: 10px;
  border: none;
  background: rgba(255, 255, 255, 0.06);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}

.icon-picker__option--active {
  box-shadow: 0 0 0 2px #ffffff inset;
}
</style>
