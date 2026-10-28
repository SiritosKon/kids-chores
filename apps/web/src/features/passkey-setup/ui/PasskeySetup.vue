<template>
  <q-card flat bordered class="bg-grey-10">
    <q-card-section class="row items-center no-wrap q-gutter-md">
      <q-icon name="fingerprint" size="32px" color="primary" />
      <div class="col">
        <div class="text-subtitle1">{{ t('passkeySetup.title') }}</div>
        <div class="text-caption text-grey-5">
          {{ supported ? t('passkeySetup.offer') : t('passkeySetup.unsupported') }}
        </div>
      </div>
    </q-card-section>
    <q-card-actions v-if="supported" align="right">
      <q-btn
        v-if="onThisDevice"
        flat
        no-caps
        color="grey-5"
        :label="t('passkeySetup.disable')"
        :loading="busy"
        @click="turnOff"
      />
      <q-btn
        v-else
        unelevated
        no-caps
        color="primary"
        text-color="black"
        :label="t('passkeySetup.enable')"
        :loading="busy"
        @click="turnOn"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { browserSupportsWebAuthn } from '@simplewebauthn/browser';
import { rememberedPasskeyId, useAccountStore } from '@/entities/account';
import { disablePasskey, enablePasskey } from '../model/passkeys';

const $q = useQuasar();
const { t } = useI18n();
const account = useAccountStore();

const supported = browserSupportsWebAuthn();
const onThisDevice = ref(rememberedPasskeyId() !== null);
const busy = ref(false);

const run = async (action: () => Promise<boolean>, success: string, failure: string): Promise<void> => {
  busy.value = true;
  try {
    const done = await action();
    if (done) {
      onThisDevice.value = rememberedPasskeyId() !== null;
      await account.refresh();
    }
    $q.notify({ type: done ? 'positive' : 'negative', message: done ? success : failure });
  } finally {
    busy.value = false;
  }
};

const turnOn = (): Promise<void> => run(enablePasskey, t('passkeySetup.enabled'), t('passkeySetup.enableFailed'));

const turnOff = (): Promise<void> => run(disablePasskey, t('passkeySetup.disabled'), t('passkeySetup.disableFailed'));
</script>
