<template>
  <div class="row items-center no-wrap q-gutter-xs">
    <q-btn round flat dense icon="event" color="primary" aria-label="Выбрать дату">
      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
        <q-date :model-value="modelValue" mask="YYYY-MM-DD" :options="dateOptions" @update:model-value="onPick" />
      </q-popup-proxy>
    </q-btn>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useParentSessionStore } from '@/entities/parent-session';
import { weekDayKeys } from '@/shared/lib/week';

const props = defineProps({
  modelValue: { type: String, required: true },
});
const emit = defineEmits(['update:modelValue']);

const { active: parentActive } = storeToRefs(useParentSessionStore());

const weekSlashKeys = computed(() => new Set(weekDayKeys(new Date()).map((key) => key.replace(/-/g, '/'))));

function dateOptions(dateStr) {
  if (parentActive.value) {
    return true;
  }
  return weekSlashKeys.value.has(dateStr);
}

function onPick(value) {
  if (value) {
    emit('update:modelValue', value);
  }
}
</script>
