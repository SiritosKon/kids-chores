<template>
  <div>
    <div class="text-center text-grey-5 q-mb-md">{{ RESET_STEP_TITLES[step] }}</div>
    <div v-if="step === 'check'" class="form-stack">
      <div class="text-center text-h5">Сколько будет {{ check.question }}?</div>
      <q-input
        v-model="answer"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        label="Ответ"
        autofocus
        :error="checkError"
        error-message="Неверно. Вот другой пример"
        @keyup.enter="submitCheck"
      />
      <div class="row">
        <q-btn flat no-caps label="Назад" @click="emit('cancel')" />
        <q-space />
        <q-btn unelevated no-caps color="primary" label="Дальше" :disable="answer.trim() === ''" @click="submitCheck" />
      </div>
    </div>
    <PinInput v-else :key="step" v-model="pin" :length="PARENT_PIN_LENGTH" :error="pinError" @complete="onPin" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import PinInput from '@/shared/ui/PinInput.vue';
import { useParentSessionStore } from '@/entities/parent-session';
import { useSettingsStore, PARENT_PIN_LENGTH } from '@/entities/settings';
import { makeParentCheck } from '../lib/parentCheck';
import { RESET_STEP_TITLES } from '../model/constants';
import type { ResetStep } from '../model/types';

const emit = defineEmits<{ done: []; cancel: [] }>();

const $q = useQuasar();
const parentSession = useParentSessionStore();
const settingsStore = useSettingsStore();

const step = ref<ResetStep>('check');
const check = ref(makeParentCheck());
const answer = ref('');
const checkError = ref(false);
const pin = ref('');
const nextPin = ref('');
const pinError = ref(false);

const submitCheck = (): void => {
  if (Number(answer.value.trim()) === check.value.answer) {
    step.value = 'next';
    return;
  }
  check.value = makeParentCheck();
  answer.value = '';
  checkError.value = true;
};

const onPin = async (value: string): Promise<void> => {
  pinError.value = false;
  if (step.value === 'next') {
    nextPin.value = value;
    step.value = 'repeat';
    pin.value = '';
    return;
  }
  if (value !== nextPin.value) {
    requestAnimationFrame(() => {
      step.value = 'next';
      pinError.value = true;
      pin.value = '';
    });
    return;
  }
  await settingsStore.update({ parentPin: value });
  parentSession.unlock();
  $q.notify({ type: 'positive', message: 'PIN изменён, родительский режим включён' });
  emit('done');
};
</script>
