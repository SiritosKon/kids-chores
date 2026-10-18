<template>
  <q-page class="onboarding q-pa-lg">
    <div class="onboarding__intro">
      <div class="onboarding__emoji">🏁</div>
      <div class="text-h5 text-weight-bold q-mb-sm">{{ t('onboardingPage.welcome') }}</div>
      <p class="text-grey-5">{{ t('onboardingPage.intro') }}</p>
      <div class="onboarding__alpha">
        <q-icon name="science" size="20px" class="onboarding__alpha-icon" />
        <div>
          <div class="text-weight-bold">{{ t('onboardingPage.alphaTitle') }}</div>
          <div>{{ t('onboardingPage.alphaText') }}</div>
        </div>
      </div>
    </div>

    <div class="onboarding__pin">
      <div class="text-center text-subtitle1 q-mb-lg">{{ t(PIN_SETUP_TITLE_KEYS[step]) }}</div>
      <PinInput :key="step" v-model="pin" :length="PARENT_PIN_LENGTH" :error="error" @complete="onPin" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import PinInput from '@/shared/ui/PinInput.vue';
import { useParentSessionStore } from '@/entities/parent-session';
import { currentLocale } from '@/shared/i18n';
import { setupParentPin, PARENT_PIN_LENGTH } from '@/entities/settings';
import { PIN_SETUP_TITLE_KEYS } from '../model/constants';
import type { PinSetupStep } from '../model/types';

const $q = useQuasar();
const { t } = useI18n();
const parentSession = useParentSessionStore();

const step = ref<PinSetupStep>('choose');
const pin = ref('');
const chosen = ref('');
const error = ref(false);

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
  await setupParentPin(value, currentLocale());
  parentSession.unlock();
};
</script>

<style scoped>
.onboarding {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.onboarding__intro {
  max-width: 440px;
  text-align: center;
  margin: 24px 0 32px;
}

.onboarding__pin {
  width: 100%;
  max-width: 440px;
}

.onboarding__alpha {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(255, 159, 10, 0.12);
  color: #ffd9a0;
  font-size: 14px;
  line-height: 1.45;
  text-align: left;
}

.onboarding__alpha-icon {
  flex: 0 0 auto;
  color: #ff9f0a;
  margin-top: 1px;
}

.onboarding__emoji {
  font-size: 56px;
  line-height: 1;
  margin-bottom: 12px;
}
</style>
