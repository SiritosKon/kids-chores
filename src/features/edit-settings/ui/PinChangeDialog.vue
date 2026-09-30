<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" @before-show="reset">
    <q-card class="dialog--form">
      <q-card-section class="row items-center">
        <div class="text-h6">Смена PIN</div>
        <q-space />
        <q-btn flat round dense icon="close" v-close-popup aria-label="Закрыть" />
      </q-card-section>
      <q-separator />

      <q-card-section class="q-pb-lg">
        <div class="text-center text-grey-5 q-mb-lg">{{ PIN_STEP_TITLES[pinStep] }}</div>
        <PinInput :key="pinStep" v-model="pin" :length="PARENT_PIN_LENGTH" :error="pinError" @complete="onPin" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import PinInput from '@/shared/ui/PinInput.vue';
import { useSettingsStore, PARENT_PIN_LENGTH } from '@/entities/settings';
import { PIN_STEP_TITLES } from '../model/constants';
import type { PinStep } from '../model/types';

withDefaults(defineProps<{ modelValue?: boolean }>(), { modelValue: false });
const emit = defineEmits<{ 'update:modelValue': [open: boolean] }>();

const $q = useQuasar();
const settingsStore = useSettingsStore();

const pinStep = ref<PinStep>('current');
const pin = ref('');
const nextPin = ref('');
const pinError = ref(false);

const reset = (): void => {
  pinStep.value = 'current';
  pin.value = '';
  pinError.value = false;
};

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
    if (value !== settingsStore.settings?.parentPin) {
      failPin('current');
      return;
    }
    pinStep.value = 'next';
  } else if (pinStep.value === 'next') {
    nextPin.value = value;
    pinStep.value = 'repeat';
  } else if (value === nextPin.value) {
    await settingsStore.update({ parentPin: value });
    $q.notify({ type: 'positive', message: 'PIN изменён' });
    emit('update:modelValue', false);
    return;
  } else {
    failPin('next');
    return;
  }
  pin.value = '';
};
</script>
