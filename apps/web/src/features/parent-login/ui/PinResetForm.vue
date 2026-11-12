<template>
  <div>
    <div class="text-center text-grey-5 q-mb-md">{{ t(RESET_STEP_TITLES[step]) }}</div>
    <div v-if="step === 'email'" class="form-stack">
      <div class="text-grey-5">{{ t('parentLogin.emailIntro') }}</div>
      <q-input
        v-model="email"
        type="email"
        autocomplete="email"
        :label="t('parentLogin.emailLabel')"
        autofocus
        :error="emailError !== null"
        :error-message="emailError ?? ''"
        @keyup.enter="sendCode"
      />
      <div class="row">
        <q-btn flat no-caps :label="t('common.back')" @click="emit('cancel')" />
        <q-space />
        <q-btn unelevated no-caps color="primary" :label="t('parentLogin.sendCode')" :loading="busy" :disable="email.trim() === ''" @click="sendCode" />
      </div>
    </div>
    <div v-else-if="step === 'code'" class="form-stack">
      <div class="text-grey-5">{{ t('parentLogin.codeIntro', { email: sentTo }) }}</div>
      <q-input
        v-model="code"
        type="text"
        inputmode="numeric"
        autocomplete="one-time-code"
        maxlength="6"
        :label="t('parentLogin.codeLabel')"
        autofocus
        :error="codeError !== null"
        :error-message="codeError ?? ''"
        @update:model-value="onCode"
      />
      <div class="row">
        <q-btn flat no-caps :label="t('parentLogin.resend')" :disable="busy" @click="step = 'email'" />
        <q-space />
        <q-spinner v-if="busy" color="primary" size="24px" />
      </div>
    </div>
    <div v-else-if="step === 'check'" class="form-stack">
      <div class="text-center text-h5">{{ t('parentLogin.question', { question: check.question }) }}</div>
      <q-input
        v-model="answer"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        :label="t('parentLogin.answer')"
        autofocus
        :error="checkError"
        :error-message="t('parentLogin.wrongAnswer')"
        @keyup.enter="submitCheck"
      />
      <div class="row">
        <q-btn flat no-caps :label="t('common.back')" @click="emit('cancel')" />
        <q-space />
        <q-btn
          unelevated
          no-caps
          color="primary"
          :label="t('common.next')"
          :disable="answer.trim() === ''"
          @click="submitCheck"
        />
      </div>
    </div>
    <PinInput v-else :key="step" v-model="pin" :length="PARENT_PIN_LENGTH" :error="pinError" @complete="onPin" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import PinInput from '@/shared/ui/PinInput.vue';
import { useParentSessionStore } from '@/entities/parent-session';
import { EMAIL_CODE_PATTERN, emailSchema } from '@kids-chores/contracts';
import { currentLocale } from '@/shared/i18n';
import { checkPinCode, requestPinCode, useAccountStore } from '@/entities/account';
import { useSettingsStore, PARENT_PIN_LENGTH } from '@/entities/settings';
import { makeParentCheck } from '../lib/parentCheck';
import { clearPinFailures } from '../lib/pinLock';
import { RESET_STEP_TITLES } from '../model/constants';
import type { ResetStep } from '../model/types';

const emit = defineEmits<{ done: []; cancel: [] }>();

const $q = useQuasar();
const { t } = useI18n();
const parentSession = useParentSessionStore();
const settingsStore = useSettingsStore();

const account = useAccountStore();
const step = ref<ResetStep>(account.me?.hasEmail === true ? 'email' : 'check');
const email = ref('');
const emailError = ref<string | null>(null);
const sentTo = ref('');
const code = ref('');
const codeError = ref<string | null>(null);
const busy = ref(false);
const check = ref(makeParentCheck());
const answer = ref('');
const checkError = ref(false);
const pin = ref('');
const nextPin = ref('');
const pinError = ref(false);

const SEND_ERRORS = {
  mismatch: 'parentLogin.mismatch',
  tooMany: 'parentLogin.tooMany',
  offline: 'parentLogin.offline',
  failed: 'parentLogin.mailFailed',
} as const;

const sendCode = async (): Promise<void> => {
  const address = emailSchema.safeParse(email.value);
  if (!address.success) {
    emailError.value = t('shared.contact.invalid');
    return;
  }
  busy.value = true;
  const result = await requestPinCode(address.data, currentLocale());
  busy.value = false;
  if (result !== 'sent') {
    emailError.value = t(SEND_ERRORS[result]);
    return;
  }
  emailError.value = null;
  sentTo.value = address.data;
  code.value = '';
  codeError.value = null;
  step.value = 'code';
};

const onCode = async (value: string | number | null): Promise<void> => {
  const entered = String(value ?? '').replace(/\D/g, '');
  code.value = entered;
  if (!EMAIL_CODE_PATTERN.test(entered) || busy.value) {
    return;
  }
  busy.value = true;
  const result = await checkPinCode(entered);
  busy.value = false;
  if (result === 'ok') {
    step.value = 'next';
    return;
  }
  if (result === 'gone') {
    emailError.value = t('parentLogin.codeGone');
    step.value = 'email';
    return;
  }
  code.value = '';
  codeError.value = t(result === 'wrong' ? 'parentLogin.wrongCode' : 'parentLogin.offline');
};

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
  await settingsStore.changePin(value);
  clearPinFailures();
  parentSession.unlock();
  $q.notify({ type: 'positive', message: t('parentLogin.pinChanged') });
  emit('done');
};
</script>
