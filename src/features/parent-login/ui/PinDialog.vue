<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" @hide="reset">
    <q-card class="pin-card">
      <q-card-section class="row items-center">
        <div class="text-h6">{{ mode === 'reset' ? 'Сброс PIN' : 'Родительский режим' }}</div>
        <q-space />
        <q-btn flat round dense icon="close" v-close-popup aria-label="Закрыть" />
      </q-card-section>
      <q-card-section v-if="modelValue && mode === 'reset'" class="q-pt-sm q-pb-lg">
        <PinResetForm @done="close" @cancel="mode = 'login'" />
      </q-card-section>
      <q-card-section v-else-if="modelValue" class="q-pt-sm q-pb-md">
        <PinInput v-model="pin" :length="PARENT_PIN_LENGTH" :error="error" @complete="submit" />
        <div class="row justify-end q-mt-sm">
          <q-btn flat dense no-caps color="grey-5" label="Забыли PIN?" @click="mode = 'reset'" />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import PinInput from '@/shared/ui/PinInput.vue';
import { useParentSessionStore } from '@/entities/parent-session';
import { useSettingsStore, PARENT_PIN_LENGTH } from '@/entities/settings';
import PinResetForm from './PinResetForm.vue';
import type { PinDialogMode } from '../model/types';

withDefaults(defineProps<{ modelValue?: boolean }>(), { modelValue: false });
const emit = defineEmits<{ 'update:modelValue': [open: boolean] }>();

const $q = useQuasar();
const parentSession = useParentSessionStore();
const settingsStore = useSettingsStore();

const pin = ref('');
const error = ref(false);
const mode = ref<PinDialogMode>('login');

const reset = (): void => {
  pin.value = '';
  error.value = false;
  mode.value = 'login';
};

const close = (): void => {
  emit('update:modelValue', false);
};

const submit = (value: string): void => {
  if (value === settingsStore.settings?.parentPin) {
    parentSession.unlock();
    $q.notify({ type: 'positive', message: 'Родительский режим включён' });
    close();
    return;
  }
  error.value = false;
  requestAnimationFrame(() => {
    error.value = true;
    pin.value = '';
  });
};
</script>

<style scoped>
.pin-card {
  width: min(360px, 92vw);
}
</style>
