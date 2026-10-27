<template>
  <q-page class="q-pa-md settings-page">
    <PageHeader :title="t('accountPage.title')" :back-to="ROUTES.home" />

    <q-banner v-if="failedProvider" rounded class="bg-negative text-white q-mb-md">
      {{ t('accountPage.signInFailed') }}
    </q-banner>

    <div v-if="!account.loaded" class="row justify-center q-pa-lg">
      <q-spinner color="primary" size="32px" />
    </div>

    <p v-else-if="!account.server" class="text-grey-5">{{ t('accountPage.unavailable') }}</p>

    <template v-else-if="!account.signedIn">
      <p class="text-grey-4">{{ t('accountPage.guest') }}</p>
      <SignInOptions />
    </template>

    <div v-else class="column q-gutter-md">
      <div class="row items-center no-wrap q-gutter-md">
        <q-icon name="account_circle" size="40px" color="primary" />
        <div>
          <div class="text-subtitle1">{{ t('accountPage.signedIn') }}</div>
          <div class="text-caption text-grey-5">{{ t('accountPage.deviceNote') }}</div>
        </div>
      </div>

      <SyncStatus with-button />

      <template v-if="parentActive">
        <PasskeySetup />
        <q-btn flat no-caps color="negative" icon="logout" :label="t('accountPage.signOut')" @click="confirmSignOut" />
      </template>
      <p v-else class="text-caption text-grey-5">{{ t('accountPage.parentOnly') }}</p>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ROUTES } from '@/shared/config/constants';
import PageHeader from '@/shared/ui/PageHeader.vue';
import { useAccountStore } from '@/entities/account';
import { useParentSessionStore } from '@/entities/parent-session';
import { SignInOptions } from '@/features/sign-in';
import { PasskeySetup } from '@/features/passkey-setup';
import { SyncStatus, useSyncStore } from '@/features/sync';

const $q = useQuasar();
const { t } = useI18n();
const route = useRoute();
const account = useAccountStore();
const sync = useSyncStore();
const { active: parentActive } = storeToRefs(useParentSessionStore());

const failedProvider = computed(() => typeof route.query.error === 'string' && !account.signedIn);

const confirmSignOut = (): void => {
  $q.dialog({
    title: t('accountPage.signOutTitle'),
    message: t('accountPage.signOutMessage'),
    cancel: { flat: true, noCaps: true, label: t('common.cancel') },
    ok: { flat: true, noCaps: true, color: 'negative', label: t('accountPage.signOut') },
    persistent: true,
  }).onOk(async () => {
    await sync.run();
    const done = await account.signOut();
    $q.notify({
      type: done ? 'positive' : 'negative',
      message: done ? t('accountPage.signedOut') : t('accountPage.signOutFailed'),
    });
  });
};
</script>
