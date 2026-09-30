<template>
  <div class="form-stack" data-tour="settings-bonus">
    <q-toggle
      :model-value="settingsStore.bonus.enabled"
      label="Начислять бонус, когда отмечены все задачи дня"
      color="primary"
      @update:model-value="toggle"
    />
    <q-input
      v-if="settingsStore.bonus.enabled"
      v-model.number="points"
      type="number"
      inputmode="numeric"
      label="Размер бонуса"
      :min="1"
      :error="!isValid"
      error-message="Не меньше 1 балла"
      @change="savePoints"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useSettingsStore } from '@/entities/settings';

const settingsStore = useSettingsStore();

const points = ref(settingsStore.bonus.points || 1);

watch(
  () => settingsStore.bonus.points,
  (stored) => {
    points.value = stored || 1;
  }
);

const isValid = computed(() => Number.isInteger(points.value) && points.value >= 1);

const toggle = (enabled: boolean): Promise<void> =>
  settingsStore.update({ bonus: { enabled, points: isValid.value ? points.value : 1 } });

const savePoints = async (): Promise<void> => {
  if (isValid.value && points.value !== settingsStore.bonus.points) {
    await settingsStore.update({ bonus: { ...settingsStore.bonus, points: points.value } });
  }
};
</script>
