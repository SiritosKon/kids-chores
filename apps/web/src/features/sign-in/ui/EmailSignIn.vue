<template>
  <div class="email-sign-in form-stack">
    <template v-if="step === 'newPassword'">
      <div class="text-caption text-grey-5">{{ t('signIn.newPasswordIntro') }}</div>
      <PasswordForm :cancel-label="t('signIn.skip')" @saved="emit('signedIn')" @cancel="emit('signedIn')" />
    </template>
    <form v-else-if="mode === 'password'" class="form-stack" @submit.prevent="signInWithPassword">
      <q-input
        v-model="email"
        dense
        outlined
        dark
        type="email"
        autocomplete="username"
        autofocus
        :label="t('signIn.emailLabel')"
      />
      <q-input
        v-model="password"
        dense
        outlined
        dark
        type="password"
        autocomplete="current-password"
        :label="t('signIn.passwordLabel')"
        :error="error !== null"
        :error-message="error ?? ''"
      />
      <div class="row items-center">
        <q-btn flat dense no-caps color="grey-5" :label="t('common.back')" @click="emit('cancel')" />
        <q-space />
        <q-btn
          unelevated
          dense
          no-caps
          type="submit"
          color="primary"
          class="q-px-md"
          :label="t('signIn.signInAction')"
          :loading="busy"
          :disable="!email.trim() || !password"
        />
      </div>
      <div class="row justify-between">
        <q-btn flat dense no-caps color="grey-5" :label="t('signIn.forgotPassword')" @click="useCode(true)" />
        <q-btn flat dense no-caps color="grey-5" :label="t('signIn.useCode')" @click="useCode(false)" />
      </div>
    </form>
    <template v-else-if="sentTo === null">
      <q-input
        v-model="email"
        dense
        outlined
        dark
        type="email"
        autocomplete="email"
        autofocus
        :label="t('signIn.emailLabel')"
        :error="error !== null"
        :error-message="error ?? ''"
        @keyup.enter="send"
      />
      <div class="row">
        <q-btn flat dense no-caps color="grey-5" :label="t('common.back')" @click="emit('cancel')" />
        <q-space />
        <q-btn
          unelevated
          dense
          no-caps
          color="primary"
          class="q-px-md"
          :label="t('signIn.sendCode')"
          :loading="busy"
          :disable="!email.trim()"
          @click="send"
        />
      </div>
    </template>
    <template v-else>
      <div class="text-caption text-grey-5">{{ t('signIn.codeIntro', { email: sentTo }) }}</div>
      <q-input
        v-model="code"
        dense
        outlined
        dark
        type="text"
        inputmode="numeric"
        autocomplete="one-time-code"
        maxlength="6"
        autofocus
        :label="t('signIn.codeLabel')"
        :error="error !== null"
        :error-message="error ?? ''"
        @update:model-value="onCode"
      />
      <div class="row items-center">
        <q-btn flat dense no-caps color="grey-5" :label="t('signIn.otherEmail')" :disable="busy" @click="sentTo = null" />
        <q-space />
        <q-spinner v-if="busy" color="primary" size="20px" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { EMAIL_CODE_PATTERN, emailSchema } from '@kids-chores/contracts';
import { currentLocale } from '@/shared/i18n';
import { PasswordForm, passwordSignIn, requestSignInCode, verifySignInCode } from '@/entities/account';
import { CODE_ERRORS, PASSWORD_ERRORS, SEND_ERRORS } from '../model/constants';
import type { EmailMode, EmailStep } from '../model/types';

const props = withDefaults(defineProps<{ initialMode?: EmailMode }>(), { initialMode: 'code' });
const emit = defineEmits<{ cancel: []; signedIn: [] }>();

const { t } = useI18n();
const mode = ref<EmailMode>(props.initialMode);
const step = ref<EmailStep>('signIn');
const forgot = ref(false);
const email = ref('');
const password = ref('');
const sentTo = ref<string | null>(null);
const code = ref('');
const error = ref<string | null>(null);
const busy = ref(false);

const useCode = (forgotten: boolean): void => {
  forgot.value = forgotten;
  error.value = null;
  mode.value = 'code';
};

const signInWithPassword = async (): Promise<void> => {
  const address = emailSchema.safeParse(email.value);
  if (!address.success || !password.value || busy.value) {
    error.value = address.success ? null : t('shared.contact.invalid');
    return;
  }
  busy.value = true;
  const result = await passwordSignIn(address.data, password.value);
  busy.value = false;
  if (result === 'ok') {
    emit('signedIn');
    return;
  }
  password.value = '';
  error.value = t(PASSWORD_ERRORS[result]);
};

const send = async (): Promise<void> => {
  const address = emailSchema.safeParse(email.value);
  if (!address.success) {
    error.value = t('shared.contact.invalid');
    return;
  }
  busy.value = true;
  const result = await requestSignInCode(address.data, currentLocale());
  busy.value = false;
  if (result !== 'sent') {
    error.value = t(SEND_ERRORS[result]);
    return;
  }
  error.value = null;
  code.value = '';
  sentTo.value = address.data;
};

const onCode = async (value: string | number | null): Promise<void> => {
  const entered = String(value ?? '').replace(/\D/g, '');
  code.value = entered;
  if (sentTo.value === null || !EMAIL_CODE_PATTERN.test(entered) || busy.value) {
    return;
  }
  busy.value = true;
  const result = await verifySignInCode(sentTo.value, entered);
  busy.value = false;
  if (result === 'ok') {
    if (forgot.value) {
      step.value = 'newPassword';
      return;
    }
    emit('signedIn');
    return;
  }
  code.value = '';
  error.value = t(CODE_ERRORS[result]);
  if (result === 'gone') {
    sentTo.value = null;
  }
};
</script>

<style scoped>
.email-sign-in {
  width: 100%;
  max-width: 340px;
  text-align: left;
}
</style>
