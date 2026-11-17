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
    <div v-else-if="step === 'providers'" class="form-stack">
      <div class="text-grey-5">{{ providers.length > 0 ? t('parentLogin.providerOnlyIntro') : t('parentLogin.noWay') }}</div>
      <div class="row">
        <q-btn flat no-caps :label="t('common.back')" @click="emit('cancel')" />
      </div>
    </div>
    <template v-else>
      <PinInput :key="step" v-model="pin" :length="PARENT_PIN_LENGTH" :error="pinError" @complete="onPin" />
      <div class="text-center text-caption text-grey-6 q-mt-sm">{{ t('shared.pinHint') }}</div>
    </template>
    <div v-if="(step === 'email' || step === 'providers') && providers.length > 0" class="q-mt-md">
      <div v-if="step === 'email'" class="text-grey-5 q-mb-sm">{{ t('parentLogin.providerIntro') }}</div>
      <div class="row q-gutter-sm">
        <q-btn
          v-for="provider in providers"
          :key="provider"
          outline
          no-caps
          color="grey-5"
          :label="t(PROVIDER_LABELS[provider])"
          @click="reauth(provider)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import PinInput from '@/shared/ui/PinInput.vue';
import { useParentSessionStore } from '@/entities/parent-session';
import { EMAIL_CODE_PATTERN, emailSchema, type AuthProvider } from '@kids-chores/contracts';
import { currentLocale } from '@/shared/i18n';
import { checkPinCode, providerReauthUrl, requestPinCode, useAccountStore } from '@/entities/account';
import { PARENT_PIN_LENGTH } from '@/entities/settings';
import { clearPinFailures } from '../lib/pinLock';
import { PROVIDER_LABELS, RESET_STEP_TITLES } from '../model/constants';
import type { ResetStep } from '../model/types';

const props = withDefaults(defineProps<{ granted?: boolean }>(), { granted: false });
const emit = defineEmits<{ done: []; cancel: [] }>();

const $q = useQuasar();
const { t } = useI18n();
const parentSession = useParentSessionStore();
const account = useAccountStore();
const providers = computed<readonly AuthProvider[]>(() => account.me?.providers ?? []);
const firstStep = (): ResetStep => (account.me?.hasEmail === true ? 'email' : 'providers');
const step = ref<ResetStep>(props.granted ? 'next' : firstStep());
const email = ref('');
const emailError = ref<string | null>(null);
const sentTo = ref('');
const code = ref('');
const codeError = ref<string | null>(null);
const busy = ref(false);
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

const reauth = (provider: AuthProvider): void => {
  window.location.assign(providerReauthUrl(provider));
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
  const result = await account.setPin(value);
  if (result !== 'ok') {
    $q.notify({ type: 'negative', message: t(result === 'denied' ? 'parentLogin.resetExpired' : 'parentLogin.saveFailed') });
    step.value = result === 'denied' ? firstStep() : 'next';
    pin.value = '';
    return;
  }
  clearPinFailures();
  parentSession.unlock();
  $q.notify({ type: 'positive', message: t('parentLogin.pinChanged') });
  emit('done');
};
</script>
