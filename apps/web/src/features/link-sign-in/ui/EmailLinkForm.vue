<template>
  <div class="form-stack">
    <template v-if="sentTo === null">
      <q-input
        v-model="email"
        outlined
        dark
        type="email"
        autocomplete="email"
        autofocus
        :label="t('linkSignIn.emailLabel')"
        :error="error !== null"
        :error-message="error ?? ''"
        @keyup.enter="send"
      />
      <div class="row">
        <q-btn flat no-caps color="grey-5" :label="cancelLabel" @click="emit('cancel')" />
        <q-space />
        <q-btn
          unelevated
          no-caps
          color="primary"
          class="q-px-md"
          :label="t('linkSignIn.sendCode')"
          :loading="busy"
          :disable="!email.trim()"
          @click="send"
        />
      </div>
    </template>
    <template v-else>
      <div class="text-grey-5">{{ t('linkSignIn.codeIntro', { email: sentTo }) }}</div>
      <q-input
        v-model="code"
        outlined
        dark
        type="text"
        inputmode="numeric"
        autocomplete="one-time-code"
        maxlength="6"
        autofocus
        :label="t('linkSignIn.codeLabel')"
        :error="error !== null"
        :error-message="error ?? ''"
        @update:model-value="onCode"
      />
      <div class="row items-center">
        <q-btn flat no-caps color="grey-5" :label="t('linkSignIn.otherEmail')" :disable="busy" @click="sentTo = null" />
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
import { requestEmailLinkCode, useAccountStore, verifyEmailLink } from '@/entities/account';
import { CODE_ERRORS, SEND_ERRORS } from '../model/constants';

defineProps<{ cancelLabel: string }>();
const emit = defineEmits<{ cancel: []; added: [] }>();

const { t } = useI18n();
const account = useAccountStore();
const email = ref('');
const sentTo = ref<string | null>(null);
const code = ref('');
const error = ref<string | null>(null);
const busy = ref(false);

const send = async (): Promise<void> => {
  const address = emailSchema.safeParse(email.value);
  if (!address.success) {
    error.value = t('shared.contact.invalid');
    return;
  }
  busy.value = true;
  const result = await requestEmailLinkCode(address.data, currentLocale());
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
  const result = await verifyEmailLink(sentTo.value, entered);
  if (result === 'ok') {
    await account.refresh();
    busy.value = false;
    emit('added');
    return;
  }
  busy.value = false;
  code.value = '';
  error.value = t(CODE_ERRORS[result]);
  if (result === 'gone' || result === 'taken') {
    sentTo.value = null;
  }
};
</script>
