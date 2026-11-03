<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" @hide="reset">
    <q-card class="pin-card">
      <q-card-section class="row items-center">
        <div class="text-h6">{{ mode === 'reset' ? t('parentLogin.resetTitle') : t('parentLogin.title') }}</div>
        <q-space />
        <q-btn flat round dense icon="close" v-close-popup :aria-label="t('common.close')" />
      </q-card-section>
      <q-card-section v-if="modelValue && mode === 'reset'" class="q-pt-sm q-pb-lg">
        <PinResetForm cancellable @done="onReset" @cancel="mode = 'login'" />
      </q-card-section>
      <q-card-section v-else-if="modelValue" class="q-pt-sm q-pb-md">
        <div v-if="lockedMs > 0" class="text-center text-grey-4 q-py-md">
          {{ t('parentLogin.locked', { time: lockedText }) }}
        </div>
        <PinInput v-else v-model="pin" :length="PARENT_PIN_LENGTH" :error="error" @complete="submit" />
        <div class="row justify-end q-mt-sm">
          <q-btn flat dense no-caps color="grey-5" :label="t('parentLogin.forgot')" @click="mode = 'reset'" />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import PinInput from '@/shared/ui/PinInput.vue';
import { useParentSessionStore } from '@/entities/parent-session';
import { useSettingsStore, PARENT_PIN_LENGTH } from '@/entities/settings';
import { usePinLock } from '../model/usePinLock';
import PinResetForm from './PinResetForm.vue';
import type { PinDialogMode } from '../model/types';

const props = withDefaults(defineProps<{ modelValue?: boolean }>(), { modelValue: false });
const emit = defineEmits<{ 'update:modelValue': [open: boolean] }>();

const $q = useQuasar();
const { t } = useI18n();
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

const { lockedMs, lockedText, watchLock, fail, clear } = usePinLock();

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      watchLock();
    }
  },
  { immediate: true }
);

const onReset = (): void => {
  clear();
  parentSession.unlock();
  $q.notify({ type: 'positive', message: t('parentLogin.pinChanged') });
  close();
};

const submit = async (value: string): Promise<void> => {
  if (await settingsStore.checkPin(value)) {
    clear();
    parentSession.unlock();
    $q.notify({ type: 'positive', message: t('parentLogin.unlocked') });
    close();
    return;
  }
  fail();
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
