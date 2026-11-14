<template>
  <section class="ios-card q-mb-lg">
    <q-item class="q-py-md">
      <q-item-section avatar><AccountAvatar size="48px" /></q-item-section>
      <q-item-section>
        <q-item-label class="text-subtitle1 ellipsis">{{ account.name ?? t('accountCard.title') }}</q-item-label>
        <SyncStatus class="q-mt-xs" />
      </q-item-section>
      <q-item-section side>
        <q-btn flat round dense icon="edit" color="grey-5" :aria-label="t('accountCard.rename')" :disable="busy" @click="rename" />
      </q-item-section>
    </q-item>
    <q-separator />
    <SignInMethods />
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
import { ACCOUNT_NAME_MAX } from '@kids-chores/contracts';
import { AccountAvatar, useAccountStore } from '@/entities/account';
import { SignInMethods } from '@/features/link-sign-in';
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

const rename = (): void => {
  $q.dialog({
    title: t('accountCard.renameTitle'),
    prompt: {
      model: account.name ?? '',
      type: 'text',
      outlined: true,
      isValid: (value: string) => value.trim().length > 0 && value.trim().length <= ACCOUNT_NAME_MAX,
    },
    cancel: { flat: true, noCaps: true, label: t('common.cancel') },
    ok: { flat: true, noCaps: true, label: t('common.save') },
  }).onOk(async (value: string) => {
    if (!(await account.rename(value))) {
      $q.notify({ type: 'negative', message: t('accountCard.renameFailed') });
    }
  });
};

const confirmRemoval = async (): Promise<void> => {
  const message = (account.me?.members ?? 1) > 1 ? t('accountCard.removeMemberMessage') : t('accountCard.removeMessage');
  if (!(await ask(t('accountCard.removeTitle'), message, t('accountCard.removeConfirm')))) {
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
