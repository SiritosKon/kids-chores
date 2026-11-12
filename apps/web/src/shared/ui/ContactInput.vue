<template>
  <div>
    <q-btn-toggle
      v-if="kinds.length > 1"
      :model-value="modelValue.kind"
      :options="kinds.map((kind) => ({ value: kind, label: t(KIND_LABEL_KEYS[kind]) }))"
      spread
      no-caps
      unelevated
      toggle-color="primary"
      color="grey-9"
      text-color="grey-4"
      class="q-mb-md"
      @update:model-value="(kind: ContactKind) => emit('update:modelValue', { kind, value: '' })"
    />
    <q-input
      :model-value="modelValue.value"
      outlined
      dark
      autofocus
      :type="modelValue.kind === 'email' ? 'email' : 'tel'"
      :autocomplete="modelValue.kind === 'email' ? 'email' : 'tel'"
      :label="modelValue.kind === 'email' ? t('shared.contact.emailLabel') : t('shared.contact.phoneLabel')"
      :hint="modelValue.kind === 'phone' ? t('shared.contact.phoneHint') : undefined"
      :error="error"
      :error-message="t('shared.contact.invalid')"
      @update:model-value="(value) => emit('update:modelValue', { kind: modelValue.kind, value: String(value ?? '') })"
      @keyup.enter="emit('submit')"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { ContactKind } from '@kids-chores/contracts';
import { KIND_LABEL_KEYS } from './constants';
import type { ContactDraft } from './types';

defineProps<{ modelValue: ContactDraft; kinds: readonly ContactKind[]; error?: boolean }>();
const emit = defineEmits<{ 'update:modelValue': [draft: ContactDraft]; submit: [] }>();

const { t } = useI18n();
</script>
