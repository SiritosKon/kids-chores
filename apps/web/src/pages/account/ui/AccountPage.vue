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

    <div v-else class="form-stack">
      <div class="form-row">
        <AccountAvatar size="48px" />
        <div class="col">
          <div class="text-subtitle1 ellipsis">{{ account.name ?? t('accountPage.signedIn') }}</div>
          <div class="text-caption text-grey-5">{{ t('accountPage.deviceNote') }}</div>
        </div>
      </div>

      <SyncStatus />

      <template v-if="parentActive">
        <ProfileForm />
        <PasskeySetup />
        <q-btn
          flat
          no-caps
          color="negative"
          icon="logout"
          class="self-start"
          :label="t('accountPage.signOut')"
          :loading="signingOut"
          @click="confirmSignOut"
        />
      </template>
      <template v-else>
        <div class="text-caption text-grey-5">{{ t('accountPage.parentOnly') }}</div>
        <q-btn
          outline
          no-caps
          color="primary"
          icon="lock_open"
          class="self-start q-px-lg"
          :label="t('accountPage.enterParentMode')"
          @click="showParentLogin = true"
        />
      </template>
    </div>

    <PinDialog v-model="showParentLogin" />
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ROUTES } from '@/shared/config/constants';
import PageHeader from '@/shared/ui/PageHeader.vue';
import { AccountAvatar, useAccountStore } from '@/entities/account';
import { useParentSessionStore } from '@/entities/parent-session';
import { ProfileForm } from '@/features/edit-profile';
import { PinDialog } from '@/features/parent-login';
import { SignInOptions } from '@/features/sign-in';
import { PasskeySetup } from '@/features/passkey-setup';
import { SyncStatus, useSyncStore } from '@/features/sync';

const $q = useQuasar();
const { t } = useI18n();
const route = useRoute();
const account = useAccountStore();
const sync = useSyncStore();
const { active: parentActive } = storeToRefs(useParentSessionStore());
const showParentLogin = ref(false);
const signingOut = ref(false);

const failedProvider = computed(() => typeof route.query.error === 'string' && !account.signedIn);

const ask = (title: string, message: string): Promise<boolean> =>
  new Promise((resolve) => {
    $q.dialog({
      title,
      message,
      cancel: { flat: true, noCaps: true, label: t('common.cancel') },
      ok: { flat: true, noCaps: true, color: 'negative', label: t('accountPage.signOut') },
      persistent: true,
    })
      .onOk(() => resolve(true))
      .onCancel(() => resolve(false));
  });

const confirmSignOut = async (): Promise<void> => {
  if (!(await ask(t('accountPage.signOutTitle'), t('accountPage.signOutMessage')))) {
    return;
  }
  signingOut.value = true;
  await sync.run();
  if (sync.status === 'offline') {
    signingOut.value = false;
    $q.notify({ type: 'negative', message: t('accountPage.signOutOffline') });
    return;
  }
  if (sync.pending > 0 && !(await ask(t('accountPage.unsentTitle'), t('accountPage.unsentMessage')))) {
    signingOut.value = false;
    return;
  }
  if (!(await account.signOut())) {
    signingOut.value = false;
    $q.notify({ type: 'negative', message: t('accountPage.signOutFailed') });
    return;
  }
  window.location.replace(import.meta.env.BASE_URL);
};
</script>
