<template>
  <q-dialog :model-value="true" persistent no-esc-dismiss no-backdrop-dismiss>
    <q-card class="dialog--form onboarding">
      <q-card-section class="text-center">
        <div class="onboarding__emoji">🏁</div>
        <div class="text-h6 text-weight-bold">{{ t('onboardingPage.welcome', { app: APP_NAME }) }}</div>
        <p class="text-grey-5 q-mt-sm q-mb-none">{{ t('onboardingPage.intro') }}</p>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <LanguageToggle :model-value="locale" @update:model-value="pickLocale" />
      </q-card-section>

      <q-card-section>
        <div class="text-center text-subtitle1 q-mb-sm">{{ t(PIN_SETUP_TITLE_KEYS[step]) }}</div>
        <PinInput :key="step" v-model="pin" :length="PARENT_PIN_LENGTH" :error="error" @complete="onPin" />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="onboarding__alpha">
          <q-icon name="science" size="20px" class="onboarding__alpha-icon" />
          <div>
            <div class="text-weight-bold">{{ t('onboardingPage.alphaTitle') }}</div>
            <div>{{ t('onboardingPage.alphaText') }}</div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { APP_NAME } from '@/shared/config/constants';
import { applyLocale, currentLocale, type Locale } from '@/shared/i18n';
import PinInput from '@/shared/ui/PinInput.vue';
import LanguageToggle from '@/shared/ui/LanguageToggle.vue';
import { useParentSessionStore } from '@/entities/parent-session';
import { setupParentPin, PARENT_PIN_LENGTH } from '@/entities/settings';
import { seedPresets, renamePresets, type PresetRow } from '@/features/starter-presets';
import { PIN_SETUP_TITLE_KEYS } from '../model/constants';
import type { PinSetupStep } from '../model/types';

const $q = useQuasar();
const { t, locale } = useI18n();
const parentSession = useParentSessionStore();

const step = ref<PinSetupStep>('choose');
const pin = ref('');
const chosen = ref('');
const error = ref(false);
const presets = ref<PresetRow[]>([]);

onMounted(async () => {
  presets.value = await seedPresets();
});

const pickLocale = async (picked: Locale): Promise<void> => {
  applyLocale(picked);
  await renamePresets(presets.value);
};

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

.onboarding__emoji {
  font-size: 44px;
  line-height: 1;
  margin-bottom: 8px;
}
</style>
