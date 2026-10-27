<template>
  <div>
    <div class="sign-in-options__buttons">
      <q-btn
        v-if="hasGoogle"
        unelevated
        no-caps
        color="white"
        text-color="black"
        icon="login"
        class="q-px-lg"
        :label="t('signIn.google')"
        @click="signInWithGoogle"
      />
      <q-btn
        v-if="passkeysSupported"
        outline
        no-caps
        color="primary"
        icon="fingerprint"
        class="q-px-lg"
        :label="t('signIn.passkey')"
        :loading="busy"
        @click="signInByPasskey"
      />
    </div>
    <div v-if="server?.devLogin" class="sign-in-options__dev row items-center no-wrap q-gutter-sm q-mt-md">
      <q-input
        v-model="devName"
        dense
        outlined
        dark
        class="col"
        :label="t('signIn.devName')"
        @keyup.enter="signInAsDev"
      />
      <q-btn flat no-caps color="grey-5" :label="t('signIn.devSignIn')" :disable="!devName.trim()" @click="signInAsDev" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { browserSupportsWebAuthn } from '@simplewebauthn/browser';
import { ROUTES } from '@/shared/config/constants';
import { devSignIn, providerStartUrl, useAccountStore } from '@/entities/account';
import { signInWithPasskey } from '../model/passkeySignIn';

const $q = useQuasar();
const { t } = useI18n();
const router = useRouter();
const account = useAccountStore();
const { server } = storeToRefs(account);

const hasGoogle = computed(() => server.value?.providers.includes('google') === true);
const passkeysSupported = browserSupportsWebAuthn();
const busy = ref(false);
const devName = ref('');

const signInWithGoogle = (): void => {
  window.location.assign(providerStartUrl('google'));
};

const finish = async (done: boolean, failure: string): Promise<void> => {
  if (done) {
    await account.refresh();
    $q.notify({ type: 'positive', message: t('signIn.signedIn') });
    void router.push(ROUTES.home);
  } else {
    $q.notify({ type: 'negative', message: failure });
  }
};

const signInByPasskey = async (): Promise<void> => {
  busy.value = true;
  try {
    await finish(await signInWithPasskey(), t('signIn.passkeyFailed'));
  } finally {
    busy.value = false;
  }
};

const signInAsDev = async (): Promise<void> => {
  const name = devName.value.trim();
  if (name) {
    await finish(await devSignIn(name), t('signIn.devFailed'));
  }
};
</script>

<style scoped>
.sign-in-options__buttons {
  display: inline-flex;
  flex-direction: column;
  gap: 8px;
  max-width: 100%;
}

.sign-in-options__dev {
  max-width: 420px;
}
</style>
