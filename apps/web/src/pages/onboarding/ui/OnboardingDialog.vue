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
          <div class="text-center"><SignInOptions /></div>
        </q-card-section>
        <q-card-section class="q-pt-none text-center">
          <q-btn flat no-caps color="grey-4" :label="t('onboardingPage.continueAsGuest')" @click="guest = true" />
          <div class="text-caption text-grey-6 q-mt-xs">{{ t('onboardingPage.guestNote') }}</div>
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

        <q-card-section v-if="!account.signedIn" class="q-pt-none">
          <div class="onboarding__alpha">
            <q-icon name="science" size="20px" class="onboarding__alpha-icon" />
            <div>
              <div class="text-weight-bold">{{ t('onboardingPage.alphaTitle') }}</div>
              <div>{{ t('onboardingPage.alphaText') }}</div>
            </div>
          </div>
        </q-card-section>
      </template>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { APP_NAME } from '@/shared/config/constants';
import { currentLocale } from '@/shared/i18n';
import PinInput from '@/shared/ui/PinInput.vue';
import { useAccountStore } from '@/entities/account';
import { useParentSessionStore } from '@/entities/parent-session';
import { setupParentPin, PARENT_PIN_LENGTH } from '@/entities/settings';
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

const guest = ref(false);
const stage = computed<OnboardingStage>(() => {
  if (!account.loaded) {
    return 'loading';
  }
  return account.server && !account.signedIn && !guest.value ? 'account' : 'pin';
});
const signInFailed = computed(() => typeof route.query.error === 'string');

const step = ref<PinSetupStep>('choose');
const pin = ref('');
const chosen = ref('');
const error = ref(false);

onMounted(() => {
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
  await sync.run();
  await setupParentPin(value, currentLocale());
  parentSession.unlock();
};
</script>

<style scoped>
.onboarding__alpha {
  display: flex;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(255, 159, 10, 0.12);
  color: #ffd9a0;
  font-size: 13px;
  line-height: 1.45;
}

.onboarding__alpha-icon {
  flex: 0 0 auto;
  color: #ff9f0a;
  margin-top: 1px;
}

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
