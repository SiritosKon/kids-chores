<template>
  <div class="row items-center no-wrap q-gutter-xs">
    <q-btn round flat dense icon="event" color="primary" aria-label="Выбрать дату">
      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
        <q-date :model-value="modelValue" mask="YYYY-MM-DD" :options="dateOptions" @update:model-value="onPick" />
      </q-popup-proxy>
    </q-btn>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { weekDayKeys } from '@/shared/lib/week';
import { useParentSessionStore } from '@/entities/parent-session';

defineProps<{ modelValue: string }>();
const emit = defineEmits<{ 'update:modelValue': [dayKey: string] }>();

const { active: parentActive } = storeToRefs(useParentSessionStore());

// q-date отдаёт даты через слэш, ключи храним через дефис.
const weekSlashKeys = computed(
  () => new Set(weekDayKeys(Date.now()).map((key) => key.replace(/-/g, '/')))
);

function dateOptions(dayKey: string): boolean {
  return parentActive.value || weekSlashKeys.value.has(dayKey);
}

function onPick(value: unknown): void {
  if (typeof value === 'string') {
    emit('update:modelValue', value);
  }
}
</script>
