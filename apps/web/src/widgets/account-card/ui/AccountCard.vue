<template>
  <section class="ios-card q-mb-lg">
    <q-item class="q-py-md">
      <q-item-section avatar><AccountAvatar size="48px" /></q-item-section>
      <q-item-section>
        <q-item-label class="text-subtitle1 ellipsis">{{ account.name ?? t('accountCard.title') }}</q-item-label>
        <SyncStatus class="q-mt-xs" />
      </q-item-section>
    </q-item>
    <q-separator />
    <PasskeySetup />
    <q-separator />
    <q-item clickable :disable="busy" @click="confirmSignOut">
      <q-item-section avatar><q-icon name="logout" /></q-item-section>
      <q-item-section>{{ t('accountCard.signOut') }}</q-item-section>
    </q-item>
    <q-separator />
    <q-item clickable :disable="busy" class="text-negative" @click="confirmRemoval">
      <q-item-section avatar><q-icon name="delete_forever" color="negative" /></q-item-section>
      <q-item-section>{{ t('accountCard.remove') }}</q-item-section>
    </q-item>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { AccountAvatar, useAccountStore } from '@/entities/account';
import { PasskeySetup } from '@/features/passkey-setup';
import { SyncStatus, useSyncStore } from '@/features/sync';

const $q = useQuasar();
const { t } = useI18n();
const account = useAccountStore();
const sync = useSyncStore();
const busy = ref(false);

const ask = (title: string, message: string, confirm: string): Promise<boolean> =>
  new Promise((resolve) => {
    $q.dialog({
      title,
      message,
      cancel: { flat: true, noCaps: true, label: t('common.cancel') },
      ok: { flat: true, noCaps: true, color: 'negative', label: confirm },
      persistent: true,
    })
      .onOk(() => resolve(true))
      .onCancel(() => resolve(false));
  });

const startOver = (): void => {
  window.location.replace(import.meta.env.BASE_URL);
};

const fail = (message: string): void => {
  busy.value = false;
  $q.notify({ type: 'negative', message });
};

const confirmSignOut = async (): Promise<void> => {
  if (!(await ask(t('accountCard.signOutTitle'), t('accountCard.signOutMessage'), t('accountCard.signOut')))) {
    return;
  }
  busy.value = true;
  await sync.run();
  if (sync.status === 'offline') {
    fail(t('accountCard.signOutOffline'));
    return;
  }
  if (
    sync.pending > 0 &&
    !(await ask(t('accountCard.unsentTitle'), t('accountCard.unsentMessage'), t('accountCard.signOut')))
  ) {
    busy.value = false;
    return;
  }
  if (!(await account.signOut())) {
    fail(t('accountCard.signOutFailed'));
    return;
  }
  startOver();
};

const confirmRemoval = async (): Promise<void> => {
  if (!(await ask(t('accountCard.removeTitle'), t('accountCard.removeMessage'), t('accountCard.removeConfirm')))) {
    return;
  }
  busy.value = true;
  if (!(await account.remove())) {
    fail(t('accountCard.removeFailed'));
    return;
  }
  startOver();
};
</script>
