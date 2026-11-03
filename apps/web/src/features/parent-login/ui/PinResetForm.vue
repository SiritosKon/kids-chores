<template>
  <div>
    <div class="text-center text-grey-5 q-mb-md">{{ t(RESET_STEP_TITLES[step], { email: sentTo }) }}</div>
    <form v-if="step === 'email'" class="form-stack" @submit.prevent="sendCode">
      <q-input
        v-model="email"
        type="email"
        inputmode="email"
        autocomplete="email"
        autocapitalize="off"
        spellcheck="false"
        :maxlength="EMAIL_MAX"
        :label="t('parentLogin.email')"
        autofocus
        :error="emailError !== ''"
        :error-message="emailError"
        @update:model-value="emailError = ''"
      />
      <div class="row">
        <q-btn v-if="cancellable" flat no-caps :label="t('common.back')" @click="emit('cancel')" />
        <q-space />
        <q-btn
          type="submit"
          unelevated
          no-caps
          color="primary"
          :label="t('parentLogin.sendCode')"
          :loading="busy"
          :disable="!emailValid"
        />
      </div>
    </form>
    <div v-else-if="step === 'code'" class="form-stack">
      <q-input
        :model-value="code"
        inputmode="numeric"
        pattern="[0-9]*"
        autocomplete="one-time-code"
        :maxlength="PIN_CODE_LENGTH"
        :label="t('parentLogin.code')"
        autofocus
        :loading="busy"
        :readonly="busy"
        :error="codeError !== ''"
        :error-message="codeError"
        @update:model-value="onCode"
      />
      <div class="row">
        <q-btn flat dense no-caps color="grey-5" :label="t('parentLogin.otherEmail')" @click="step = 'email'" />
        <q-space />
        <q-btn flat dense no-caps color="grey-5" :label="t('parentLogin.resend')" :disable="busy" @click="sendCode" />
      </div>
    </div>
    <PinInput v-else :key="step" v-model="pin" :length="PARENT_PIN_LENGTH" :error="pinError" @complete="onPin" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { EMAIL_MAX, PIN_CODE_LENGTH, emailSchema } from '@kids-chores/contracts';
import { currentLocale } from '@/shared/i18n';
import PinInput from '@/shared/ui/PinInput.vue';
import { useSettingsStore, PARENT_PIN_LENGTH } from '@/entities/settings';
import { checkPinCode, requestPinCode } from '../model/pinCodes';
import { CODE_FAILURES, EMAIL_FAILURES, RESET_STEP_TITLES } from '../model/constants';
import type { ResetStep } from '../model/types';

withDefaults(defineProps<{ cancellable?: boolean }>(), { cancellable: false });
const emit = defineEmits<{ done: []; cancel: [] }>();

const { t } = useI18n();
const settingsStore = useSettingsStore();

const step = ref<ResetStep>('email');
const busy = ref(false);
const email = ref('');
const sentTo = ref('');
const emailError = ref('');
const code = ref('');
const codeError = ref('');
const pin = ref('');
const nextPin = ref('');
const pinError = ref(false);

const emailValid = computed(() => emailSchema.safeParse(email.value.trim()).success);

const sendCode = async (): Promise<void> => {
  if (!emailValid.value || busy.value) {
    return;
  }
  busy.value = true;
  const address = email.value.trim();
  const reply = await requestPinCode(address, currentLocale());
  busy.value = false;
  if (reply === 'ok') {
    sentTo.value = address;
    code.value = '';
    codeError.value = '';
    step.value = 'code';
  } else if (step.value === 'code') {
    codeError.value = t(EMAIL_FAILURES[reply]);
  } else {
    emailError.value = t(EMAIL_FAILURES[reply]);
  }
};

const submitCode = async (value: string): Promise<void> => {
  busy.value = true;
  const reply = await checkPinCode(value);
  busy.value = false;
  if (reply === 'ok') {
    step.value = 'next';
    return;
  }
  code.value = '';
  codeError.value = t(CODE_FAILURES[reply]);
};

const onCode = (value: string | number | null): void => {
  code.value = String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, PIN_CODE_LENGTH);
  codeError.value = '';
  if (code.value.length === PIN_CODE_LENGTH) {
    void submitCode(code.value);
  }
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
  await settingsStore.changePin(value);
  emit('done');
};
</script>
