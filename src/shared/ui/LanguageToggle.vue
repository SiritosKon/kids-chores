<template>
  <q-btn-toggle
    :model-value="modelValue"
    spread
    no-caps
    unelevated
    color="grey-9"
    toggle-color="primary"
    toggle-text-color="black"
    :options="LOCALE_OPTIONS"
    @update:model-value="pick"
  />
</template>

<script setup lang="ts">
import { localeSchema, LOCALE_OPTIONS, type Locale } from '@/shared/i18n';

defineProps<{ modelValue: string }>();
const emit = defineEmits<{ 'update:modelValue': [locale: Locale] }>();

const pick = (value: unknown): void => {
  const locale = localeSchema.safeParse(value).data;
  if (locale) {
    emit('update:modelValue', locale);
  }
};
</script>
