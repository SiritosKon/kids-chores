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
import { useI18n } from 'vue-i18n';
import { APP_NAME } from '@/shared/config/constants';
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

const create = async (): Promise<void> => {
  failed.value = false;
  link.value = null;
  const invite = await createInvite();
  if (!invite) {
    failed.value = true;
    return;
  }
  link.value = inviteLink(invite.token);
  date.value = formatTimestampLong(Date.parse(invite.expiresAt));
  emit('invited');
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
