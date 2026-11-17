<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" @show="create" @hide="link = null">
    <q-card class="dialog--form">
      <q-card-section class="row items-center no-wrap">
        <div class="text-h6 col">{{ t('familyInvite.title') }}</div>
        <q-btn flat round dense icon="close" v-close-popup :aria-label="t('common.close')" />
      </q-card-section>

      <q-card-section v-if="link" class="q-pt-none">
        <p class="text-grey-5">{{ t('familyInvite.intro', { app: APP_NAME }) }}</p>
        <QrCode :value="link" :label="t('familyInvite.qrLabel')" />
        <p class="text-caption text-grey-5 q-mt-md">{{ t('familyInvite.warning', { date }) }}</p>
        <div class="row q-gutter-sm justify-end">
          <q-btn outline no-caps color="primary" icon="content_copy" :label="t('familyInvite.copy')" @click="copy" />
          <q-btn v-if="canShare" unelevated no-caps color="primary" icon="ios_share" :label="t('familyInvite.share')" @click="share" />
        </div>
        <q-separator class="q-my-md" />
        <div class="text-subtitle2 q-mb-sm">{{ t('familyInvite.byEmail') }}</div>
        <div class="row no-wrap items-start q-gutter-sm">
          <q-input
            v-model="email"
            dense
            outlined
            dark
            type="email"
            autocomplete="email"
            class="col"
            :label="t('familyInvite.emailLabel')"
            :error="emailInvalid"
            :error-message="t('shared.contact.invalid')"
            @keyup.enter="sendEmail"
          />
          <q-btn unelevated no-caps color="primary" icon="send" :label="t('familyInvite.sendEmail')" :loading="sending" :disable="!email.trim()" @click="sendEmail" />
        </div>
      </q-card-section>

      <q-card-section v-else-if="failed" class="q-pt-none">
        <p>{{ t('familyInvite.failed') }}</p>
        <div class="row justify-end">
          <q-btn flat no-caps color="primary" :label="t('familyInvite.retry')" @click="create" />
        </div>
      </q-card-section>

      <q-card-section v-else class="row justify-center q-py-lg">
        <q-spinner color="primary" size="32px" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { copyToClipboard, useQuasar } from 'quasar';
import { emailSchema } from '@kids-chores/contracts';
import { useI18n } from 'vue-i18n';
import { APP_NAME } from '@/shared/config/constants';
import { currentLocale } from '@/shared/i18n';
import { formatTimestampLong } from '@/shared/lib/date';
import QrCode from '@/shared/ui/QrCode.vue';
import { createInvite } from '@/entities/account';
import { inviteLink } from '../lib/inviteLink';

withDefaults(defineProps<{ modelValue?: boolean }>(), { modelValue: false });
const emit = defineEmits<{ 'update:modelValue': [open: boolean]; invited: [] }>();

const $q = useQuasar();
const { t } = useI18n();
const canShare = typeof navigator.share === 'function';
const link = ref<string | null>(null);
const date = ref('');
const failed = ref(false);
const email = ref('');
const emailInvalid = ref(false);
const sending = ref(false);

const create = async (): Promise<void> => {
  failed.value = false;
  link.value = null;
  email.value = '';
  emailInvalid.value = false;
  const result = await createInvite({ locale: currentLocale() });
  if (result.status !== 'created') {
    failed.value = true;
    return;
  }
  link.value = inviteLink(result.invite.token);
  date.value = formatTimestampLong(Date.parse(result.invite.expiresAt));
  emit('invited');
};

const sendEmail = async (): Promise<void> => {
  const address = emailSchema.safeParse(email.value);
  emailInvalid.value = !address.success;
  if (!address.success || sending.value) {
    return;
  }
  sending.value = true;
  const result = await createInvite({ email: address.data, locale: currentLocale() });
  sending.value = false;
  if (result.status === 'created') {
    $q.notify({ type: 'positive', message: t('familyInvite.emailSent', { email: address.data }) });
    email.value = '';
    emit('invited');
    return;
  }
  $q.notify({ type: 'negative', message: result.status === 'tooMany' ? t('familyInvite.tooMany') : t('familyInvite.emailFailed') });
};

const copy = async (): Promise<void> => {
  if (link.value) {
    await copyToClipboard(link.value);
    $q.notify({ type: 'positive', message: t('familyInvite.copied') });
  }
};

const share = async (): Promise<void> => {
  if (link.value) {
    await navigator
      .share({ title: APP_NAME, text: t('familyInvite.shareText', { app: APP_NAME }), url: link.value })
      .catch(() => undefined);
  }
};
</script>
