<template>
  <div class="q-py-lg">
    <div class="text-center text-grey-5 q-mb-lg">{{ t(PIN_STEP_TITLES[pinStep]) }}</div>
    <PinInput :key="pinStep" v-model="pin" :length="PARENT_PIN_LENGTH" :error="pinError" @complete="onPin" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import PinInput from '@/shared/ui/PinInput.vue';
import { useSettingsStore, PARENT_PIN_LENGTH } from '@/entities/settings';
import { PIN_STEP_TITLES } from '../model/constants';
import type { PinStep } from '../model/types';

const emit = defineEmits<{ done: [] }>();

const $q = useQuasar();
const { t } = useI18n();
const settingsStore = useSettingsStore();

const pinStep = ref<PinStep>('current');
const pin = ref('');
const nextPin = ref('');
const pinError = ref(false);

const failPin = (step: PinStep): void => {
  pinError.value = false;
  requestAnimationFrame(() => {
    pinStep.value = step;
    pinError.value = true;
    pin.value = '';
  });
};

const onPin = async (value: string): Promise<void> => {
  pinError.value = false;
  if (pinStep.value === 'current') {
    if (!(await settingsStore.checkPin(value))) {
      failPin('current');
      return;
    }
    pinStep.value = 'next';
  } else if (pinStep.value === 'next') {
    nextPin.value = value;
    pinStep.value = 'repeat';
  } else if (value === nextPin.value) {
    await settingsStore.changePin(value);
    $q.notify({ type: 'positive', message: t('editSettings.pinChanged') });
    emit('done');
    return;
  } else {
    failPin('next');
    return;
  }
  pin.value = '';
};
</script>
