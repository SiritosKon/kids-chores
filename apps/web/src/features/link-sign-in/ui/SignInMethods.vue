<template>
  <div>
    <q-item-label header>{{ t('linkSignIn.title') }}</q-item-label>
    <q-item v-for="provider in available" :key="provider">
      <q-item-section avatar><q-icon :name="PROVIDER_ICONS[provider]" /></q-item-section>
      <q-item-section>{{ t(PROVIDER_NAMES[provider]) }}</q-item-section>
      <q-item-section side>
        <span v-if="linked.includes(provider)" class="row items-center no-wrap text-positive">
          <q-icon name="check" class="q-mr-xs" />{{ t('linkSignIn.linked') }}
        </span>
        <q-btn v-else flat dense no-caps color="primary" :label="t('linkSignIn.connect')" @click="connect(provider)" />
      </q-item-section>
    </q-item>
    <q-item v-if="emailOn">
      <q-item-section avatar><q-icon name="mail" /></q-item-section>
      <q-item-section>
        <q-item-label>{{ t('linkSignIn.email') }}</q-item-label>
        <q-item-label v-if="!hasEmail" caption>{{ t('linkSignIn.emailHint') }}</q-item-label>
      </q-item-section>
      <q-item-section side>
        <span v-if="hasEmail" class="row items-center no-wrap text-positive">
          <q-icon name="check" class="q-mr-xs" />{{ t('linkSignIn.emailLinked') }}
        </span>
        <q-btn v-else flat dense no-caps color="primary" :label="t('linkSignIn.addEmail')" @click="adding = true" />
      </q-item-section>
    </q-item>
    <q-dialog v-model="adding">
      <q-card class="dialog--form">
        <q-card-section class="text-h6">{{ t('linkSignIn.dialogTitle') }}</q-card-section>
        <q-card-section class="q-pt-none">
          <EmailLinkForm :cancel-label="t('common.cancel')" @cancel="adding = false" @added="added" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import type { AuthProvider } from '@kids-chores/contracts';
import { providerLinkUrl, useAccountStore } from '@/entities/account';
import { PROVIDER_ICONS, PROVIDER_NAMES } from '../model/constants';
import EmailLinkForm from './EmailLinkForm.vue';

const $q = useQuasar();
const { t } = useI18n();
const account = useAccountStore();
const adding = ref(false);
const available = computed<readonly AuthProvider[]>(() => account.server?.providers ?? []);
const linked = computed<readonly AuthProvider[]>(() => account.me?.providers ?? []);
const emailOn = computed(() => account.server?.emailSignIn === true || account.me?.hasEmail === true);
const hasEmail = computed(() => account.me?.hasEmail === true);

const connect = (provider: AuthProvider): void => {
  window.location.assign(providerLinkUrl(provider));
};

const added = (): void => {
  adding.value = false;
  $q.notify({ type: 'positive', message: t('linkSignIn.emailAdded') });
};
</script>
