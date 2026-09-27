<template>
  <q-page class="onboarding q-pa-lg">
    <div class="onboarding__intro">
      <div class="onboarding__emoji">🏁</div>
      <div class="text-h5 text-weight-bold q-mb-sm">Добро пожаловать!</div>
      <p class="text-grey-5">
        Дети отмечают дела, копят баллы и обменивают их на награды. Настраивает всё родитель в
        родительском режиме — он закрыт PIN-кодом из шести цифр.
      </p>
      <div class="onboarding__alpha">
        <q-icon name="science" size="20px" class="onboarding__alpha-icon" />
        <div>
          <div class="text-weight-bold">Это альфа-версия</div>
          <div>
            Приложение работает только локально: все данные хранятся на этом устройстве и никуда не
            отправляются. Периодически делайте «Экспорт данных» в родительском режиме, чтобы не потерять
            информацию.
          </div>
        </div>
      </div>
    </div>

    <div class="onboarding__pin">
      <div class="text-center text-subtitle1 q-mb-lg">{{ PIN_SETUP_TITLES[step] }}</div>
      <PinInput :key="step" v-model="pin" :length="PARENT_PIN_LENGTH" :error="error" @complete="onPin" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import PinInput from '@/shared/ui/PinInput.vue';
import { useParentSessionStore } from '@/entities/parent-session';
import { setupParentPin, PARENT_PIN_LENGTH } from '@/entities/settings';
import { PIN_SETUP_TITLES } from '../model/constants';
import type { PinSetupStep } from '../model/types';

const $q = useQuasar();
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
    $q.notify({ type: 'negative', message: 'PIN не совпал, попробуйте ещё раз' });
    return;
  }
  await setupParentPin(value);
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
