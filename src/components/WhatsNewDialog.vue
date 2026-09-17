<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <q-card style="min-width: 320px; max-width: 92vw">
      <q-card-section class="row items-center">
        <div class="text-h6">Что нового</div>
        <q-space />
        <q-btn flat round dense icon="close" v-close-popup aria-label="Закрыть" />
      </q-card-section>
      <q-separator />
      <q-card-section style="max-height: 60vh; overflow: auto">
        <div v-for="entry in visible" :key="entry.version" class="q-mb-md">
          <div class="row items-center q-gutter-sm">
            <span class="text-weight-bold">v{{ entry.version }}</span>
            <span class="text-caption text-grey-6">{{ entry.date }}</span>
          </div>
          <ul class="q-mt-xs q-mb-none">
            <li v-for="(note, index) in entry.notes" :key="index" class="text-body2">{{ note }}</li>
          </ul>
        </div>

        <q-btn
          v-if="hasMore && !showAll"
          flat
          no-caps
          dense
          color="primary"
          :label="`Показать всю историю (${changelog.length})`"
          @click="showAll = true"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { CHANGELOG } from '../config/changelog.js';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
});
const emit = defineEmits(['update:modelValue']);

const changelog = CHANGELOG;
const VISIBLE_LIMIT = 5;
const showAll = ref(false);

const visible = computed(() => (showAll.value ? changelog : changelog.slice(0, VISIBLE_LIMIT)));
const hasMore = computed(() => changelog.length > VISIBLE_LIMIT);

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      showAll.value = false;
    }
  }
);
</script>
