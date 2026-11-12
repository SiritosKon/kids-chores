<template>
  <div class="pending-invite">
    <div v-if="invite.state === 'idle' || invite.state === 'loading'" class="row justify-center q-py-md">
      <q-spinner color="primary" size="28px" />
    </div>

    <template v-else-if="invite.state === 'ready' && invite.preview">
      <div class="row items-center no-wrap q-gutter-md">
        <q-icon name="group_add" color="primary" size="32px" />
        <div class="col">
          <div class="text-subtitle1">{{ t('joinFamily.invite', { name: invite.preview.inviterName ?? t('joinFamily.someone') }) }}</div>
          <div class="text-caption text-grey-5">
            {{ t('joinFamily.inviteCaption', { date: formatTimestampLong(Date.parse(invite.preview.expiresAt)) }) }}
          </div>
        </div>
      </div>
      <p class="text-caption text-grey-5 q-mt-md q-mb-none">
        {{ alone ? t('joinFamily.acceptAlone') : t('joinFamily.acceptShared') }}
      </p>
      <div class="row justify-end q-gutter-sm q-mt-md">
        <q-btn flat no-caps color="grey-5" :label="declineLabel" :disable="busy" @click="decline" />
        <q-btn unelevated no-caps color="primary" :label="t('joinFamily.accept')" :loading="busy" @click="accept" />
      </div>
    </template>

    <template v-else>
      <p>{{ invite.state === 'gone' ? t('joinFamily.gone') : t('joinFamily.checkFailed') }}</p>
      <div class="row justify-end q-gutter-sm">
        <q-btn v-if="invite.state === 'failed'" flat no-caps color="primary" :label="t('joinFamily.retry')" @click="invite.load()" />
        <q-btn unelevated no-caps color="primary" :label="t('joinFamily.done')" @click="decline" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { formatTimestampLong } from '@/shared/lib/date';
import { useAccountStore } from '@/entities/account';
import { usePendingInviteStore } from '../model/store';

defineProps<{ declineLabel: string }>();
const emit = defineEmits<{ joined: []; dismissed: [] }>();

const $q = useQuasar();
const { t } = useI18n();
const account = useAccountStore();
const invite = usePendingInviteStore();
const busy = ref(false);
const alone = computed(() => (account.me?.members ?? 1) < 2);

watch(
  () => invite.token,
  (token) => {
    if (token !== null) {
      void invite.load();
    }
  },
  { immediate: true }
);

watch(
  () => invite.preview?.sameFamily,
  (sameFamily) => {
    if (sameFamily === true) {
      $q.notify({ type: 'info', message: t('joinFamily.alreadyIn') });
      invite.dismiss();
      emit('dismissed');
    }
  },
  { immediate: true }
);

const decline = (): void => {
  invite.dismiss();
  emit('dismissed');
};

const accept = async (): Promise<void> => {
  busy.value = true;
  const joined = await invite.accept();
  busy.value = false;
  if (!joined) {
    $q.notify({ type: 'negative', message: t('joinFamily.failed') });
    await invite.load();
    return;
  }
  await account.refresh();
  $q.notify({ type: 'positive', message: t('joinFamily.joined') });
  emit('joined');
};
</script>
