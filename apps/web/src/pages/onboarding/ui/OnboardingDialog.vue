<template>
  <q-dialog :model-value="true" persistent no-esc-dismiss no-backdrop-dismiss>
    <q-card class="dialog--form onboarding">
      <q-card-section class="text-center">
        <div class="onboarding__emoji">🏁</div>
        <div class="text-h6 text-weight-bold">{{ t('onboardingPage.welcome', { app: APP_NAME }) }}</div>
        <p v-if="stage === 'account'" class="q-mt-sm q-mb-none">{{ t('onboardingPage.accountIntro') }}</p>
        <p v-else-if="stage === 'pin'" class="q-mt-sm q-mb-none">{{ t('onboardingPage.intro') }}</p>
      </q-card-section>

      <q-card-section v-if="stage === 'loading'" class="row justify-center q-pb-lg">
        <q-spinner color="primary" size="32px" />
      </q-card-section>

      <template v-else-if="stage === 'account'">
        <q-card-section class="q-pt-none">
          <q-banner v-if="signInFailed" rounded dense class="bg-negative text-white q-mb-md">
            {{ t('onboardingPage.signInFailed') }}
          </q-banner>
          <div v-if="account.server" class="text-center"><SignInOptions /></div>
          <div v-else class="text-center">
            <p class="text-grey-5">{{ t('onboardingPage.offline') }}</p>
            <q-btn
              outline
              no-caps
              color="primary"
              icon="refresh"
              class="q-px-lg"
              :label="t('onboardingPage.retry')"
              :loading="retrying"
              @click="retry"
            />
          </div>
        </q-card-section>
      </template>

      <template v-else>
        <q-card-section class="q-pt-none text-grey-5">
          <div>{{ t('onboardingPage.abilitiesTitle') }}</div>
          <ul class="onboarding__abilities">
            <li v-for="key in PARENT_MODE_ABILITY_KEYS" :key="key">{{ t(key) }}</li>
          </ul>
        </q-card-section>

        <q-card-section>
          <div class="text-center text-subtitle1 q-mb-sm">{{ t(PIN_SETUP_TITLE_KEYS[step]) }}</div>
          <PinInput :key="step" v-model="pin" :length="PARENT_PIN_LENGTH" :error="error" @complete="onPin" />
        </q-card-section>
      </template>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { APP_NAME } from '@/shared/config/constants';
import { currentLocale } from '@/shared/i18n';
import PinInput from '@/shared/ui/PinInput.vue';
import { useAccountStore } from '@/entities/account';
import { useParentSessionStore } from '@/entities/parent-session';
import { setupParentPin, useSettingsStore, PARENT_PIN_LENGTH } from '@/entities/settings';
import { SignInOptions } from '@/features/sign-in';
import { seedPresets } from '@/features/starter-presets';
import { useSyncStore } from '@/features/sync';
import { PARENT_MODE_ABILITY_KEYS, PIN_SETUP_TITLE_KEYS } from '../model/constants';
import type { OnboardingStage, PinSetupStep } from '../model/types';

const $q = useQuasar();
const { t } = useI18n();
const route = useRoute();
const account = useAccountStore();
const sync = useSyncStore();
const parentSession = useParentSessionStore();
const hadPin = useSettingsStore().hasPin;

const familyLoaded = ref(false);
const retrying = ref(false);
let pinChosen = false;

const stage = computed<OnboardingStage>(() => {
  if (!account.signedIn) {
    return account.loaded ? 'account' : 'loading';
  }
  return familyLoaded.value ? 'pin' : 'loading';
});

const retry = async (): Promise<void> => {
  retrying.value = true;
  await account.refresh();
  retrying.value = false;
};

const retryOnline = (): void => {
  void account.refresh();
};

watch(
  () => account.signedIn,
  async (signedIn) => {
    if (signedIn && !familyLoaded.value) {
      await sync.run();
      familyLoaded.value = true;
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  window.removeEventListener('online', retryOnline);
  if (account.signedIn && !hadPin && !pinChosen) {
    $q.notify({ type: 'info', message: t('onboardingPage.familyPin'), timeout: 8000 });
  }
});
const signInFailed = computed(() => typeof route.query.error === 'string');

const step = ref<PinSetupStep>('choose');
const pin = ref('');
const chosen = ref('');
const error = ref(false);

onMounted(() => {
  window.addEventListener('online', retryOnline);
  void seedPresets();
});

const onPin = async (value: string): Promise<void> => {
  error.value = false;
  if (step.value === 'choose') {
    chosen.value = value;
    step.value = 'repeat';
    pin.value = '';
    return;
  }
  if (value !== chosen.value) {
    requestAnimationFrame(() => {
      step.value = 'choose';
      error.value = true;
      pin.value = '';
    });
    $q.notify({ type: 'negative', message: t('onboardingPage.pinMismatch') });
    return;
  }
  pinChosen = true;
  await setupParentPin(value, currentLocale());
  parentSession.unlock();
};
</script>

<style scoped>
.onboarding__abilities {
  margin: 4px 0 0;
  padding-left: 20px;
}

.onboarding__emoji {
  font-size: 44px;
  line-height: 1;
  margin-bottom: 8px;
}
</style>
