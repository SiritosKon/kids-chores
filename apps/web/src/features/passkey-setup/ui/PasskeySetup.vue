<template>
  <q-item :tag="supported ? 'label' : 'div'" :disable="!supported">
    <q-item-section avatar><q-icon name="fingerprint" /></q-item-section>
    <q-item-section>
      <q-item-label>{{ t('passkeySetup.title') }}</q-item-label>
      <q-item-label caption class="text-grey-5">
        {{ supported ? t('passkeySetup.offer') : t('passkeySetup.unsupported') }}
      </q-item-label>
    </q-item-section>
    <q-item-section side>
      <q-spinner v-if="busy" color="primary" size="24px" />
      <q-toggle v-else :model-value="onThisDevice" :disable="!supported" color="primary" @update:model-value="toggle" />
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { browserSupportsWebAuthn } from '@simplewebauthn/browser';
import { rememberedPasskeyId } from '@/entities/account';
import { disablePasskey, enablePasskey } from '../model/passkeys';

const $q = useQuasar();
const { t } = useI18n();

const supported = browserSupportsWebAuthn();
const onThisDevice = ref(rememberedPasskeyId() !== null);
const busy = ref(false);

const run = async (action: () => Promise<boolean>, success: string, failure: string): Promise<void> => {
  busy.value = true;
  try {
    const done = await action();
    onThisDevice.value = rememberedPasskeyId() !== null;
    $q.notify({ type: done ? 'positive' : 'negative', message: done ? success : failure });
  } finally {
    busy.value = false;
  }
};

const toggle = (on: boolean): Promise<void> =>
  on
    ? run(enablePasskey, t('passkeySetup.enabled'), t('passkeySetup.enableFailed'))
    : run(disablePasskey, t('passkeySetup.disabled'), t('passkeySetup.disableFailed'));
</script>
