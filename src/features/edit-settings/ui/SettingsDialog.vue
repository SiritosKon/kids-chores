<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" @before-show="reset">
    <q-card class="dialog--form">
      <q-card-section class="row items-center">
        <q-btn v-if="view === 'pin'" flat round dense icon="arrow_back" aria-label="Назад" @click="view = 'main'" />
        <div class="text-h6">{{ view === 'pin' ? 'Смена PIN' : 'Настройки' }}</div>
        <q-space />
        <q-btn flat round dense icon="close" v-close-popup aria-label="Закрыть" />
      </q-card-section>
      <q-separator />

      <template v-if="view === 'main'">
        <q-card-section class="form-stack">
          <div class="text-subtitle1 text-weight-bold">🔥 Серия</div>
          <q-toggle
            v-model="streakEnabled"
            label="Награждать за дни подряд"
            color="primary"
            data-tour="settings-streak-toggle"
          />
          <div v-if="streakEnabled" class="form-stack" data-tour="settings-streak">
            <q-input
              v-model.number="streakDays"
              type="number"
              inputmode="numeric"
              label="Сколько дней подряд"
              :min="STREAK_MIN_DAYS"
            />
            <q-select
              :model-value="streakRewardId"
              :options="rewardOptions"
              label="Награда за серию"
              emit-value
              map-options
              clearable
              @update:model-value="pickReward"
            />
            <q-input
              v-model.number="streakPoints"
              type="number"
              inputmode="numeric"
              label="Баллы за серию"
              :min="0"
              hint="Новое правило действует с сегодняшнего дня, выданные призы не изменятся"
            />
            <div v-if="!streakHasPrize" class="text-negative text-caption">
              Укажите награду или баллы за серию
            </div>
          </div>
        </q-card-section>
        <q-separator />

        <q-card-section class="form-stack" data-tour="settings-bonus">
          <div class="text-subtitle1 text-weight-bold">⭐ Бонус за все задачи дня</div>
          <q-toggle v-model="bonusEnabled" label="Начислять бонус, когда отмечены все задачи дня" color="primary" />
          <q-input
            v-if="bonusEnabled"
            v-model.number="bonusPoints"
            type="number"
            inputmode="numeric"
            label="Размер бонуса"
            :min="1"
          />
        </q-card-section>
        <q-separator />

        <q-item clickable @click="openPin">
          <q-item-section avatar><q-icon name="pin" /></q-item-section>
          <q-item-section>Сменить PIN</q-item-section>
          <q-item-section side><q-icon name="chevron_right" /></q-item-section>
        </q-item>
        <q-separator />

        <q-card-actions align="right">
          <q-btn flat no-caps label="Отмена" v-close-popup />
          <q-btn unelevated no-caps color="primary" label="Сохранить" :disable="!canSave" @click="save" />
        </q-card-actions>
      </template>

      <q-card-section v-else class="q-pb-lg">
        <div class="text-center text-grey-5 q-mb-lg">{{ PIN_STEP_TITLES[pinStep] }}</div>
        <PinInput :key="pinStep" v-model="pin" :length="PARENT_PIN_LENGTH" :error="pinError" @complete="onPin" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { todayKey } from '@/shared/lib/date';
import PinInput from '@/shared/ui/PinInput.vue';
import { useRewardsStore } from '@/entities/reward';
import {
  useSettingsStore,
  currentMilestone,
  replaceMilestone,
  PARENT_PIN_LENGTH,
} from '@/entities/settings';
import { NEW_REWARD_OPTION, PIN_STEP_TITLES, STREAK_MIN_DAYS } from '../model/constants';
import { useSettingsDialogStore } from '../model/store';
import type { PinStep, SettingsView } from '../model/types';

withDefaults(defineProps<{ modelValue?: boolean }>(), { modelValue: false });
const emit = defineEmits<{ 'update:modelValue': [open: boolean]; changed: []; 'create-reward': [] }>();

const $q = useQuasar();
const settingsStore = useSettingsStore();
const rewardsStore = useRewardsStore();
const dialogStore = useSettingsDialogStore();

const view = ref<SettingsView>('main');
const streakEnabled = ref(false);
const streakDays = ref(7);
const streakPoints = ref(0);
const streakRewardId = ref<string | null>(null);
const bonusEnabled = ref(false);
const bonusPoints = ref(1);

const pinStep = ref<PinStep>('current');
const pin = ref('');
const nextPin = ref('');
const pinError = ref(false);

const rewardOptions = computed(() => [
  ...rewardsStore.active.map((reward) => ({
    value: reward.id,
    label: `${reward.name} · ${reward.points} б.`,
  })),
  { value: NEW_REWARD_OPTION, label: '＋ Новая награда' },
]);

const pickReward = (value: string | null): void => {
  if (value === NEW_REWARD_OPTION) {
    emit('create-reward');
    return;
  }
  streakRewardId.value = value;
};

const isCount = (value: number, min: number): boolean => Number.isInteger(value) && value >= min;

const streakHasPrize = computed(() => streakRewardId.value !== null || streakPoints.value > 0);

const canSave = computed(
  () =>
    (!streakEnabled.value ||
      (isCount(streakDays.value, STREAK_MIN_DAYS) && isCount(streakPoints.value, 0) && streakHasPrize.value)) &&
    (!bonusEnabled.value || isCount(bonusPoints.value, 1))
);

const reset = (): void => {
  view.value = 'main';
  if (!dialogStore.resume) {
    const milestone = currentMilestone(settingsStore.streak.milestones);
    streakEnabled.value = settingsStore.streak.enabled;
    streakDays.value = milestone?.days ?? 7;
    streakPoints.value = milestone?.points ?? 0;
    streakRewardId.value = milestone?.rewardId ?? null;
    bonusEnabled.value = settingsStore.bonus.enabled;
    bonusPoints.value = settingsStore.settings?.bonus.points || 1;
  }
  if (dialogStore.pickedRewardId) {
    streakEnabled.value = true;
    streakRewardId.value = dialogStore.pickedRewardId;
  }
};

watch(streakEnabled, (enabled) => {
  dialogStore.streakDraftEnabled = enabled;
});

watch(
  () => dialogStore.saveRequests,
  async () => {
    if (canSave.value) {
      await save();
    } else {
      $q.notify({ type: 'warning', message: 'Серия не сохранена: укажите награду или баллы' });
    }
  }
);

const save = async (): Promise<void> => {
  const milestones = streakEnabled.value
    ? replaceMilestone(
        settingsStore.streak.milestones,
        {
          days: streakDays.value,
          ...(streakPoints.value > 0 ? { points: streakPoints.value } : {}),
          ...(streakRewardId.value ? { rewardId: streakRewardId.value } : {}),
        },
        todayKey(),
        crypto.randomUUID()
      )
    : settingsStore.streak.milestones;
  await settingsStore.update({
    bonus: { enabled: bonusEnabled.value, points: bonusPoints.value },
    streak: { enabled: streakEnabled.value, milestones },
  });
  emit('changed');
  emit('update:modelValue', false);
  $q.notify({ type: 'positive', message: 'Настройки сохранены' });
};

const openPin = (): void => {
  view.value = 'pin';
  pinStep.value = 'current';
  pin.value = '';
  pinError.value = false;
};

const failPin = (step: PinStep): void => {
  pinError.value = false;
  requestAnimationFrame(() => {
    pinStep.value = step;
    pinError.value = true;
    pin.value = '';
  });
};

const onPin = async (value: string): Promise<void> => {
  pinError.value = false;
  if (pinStep.value === 'current') {
    if (value !== settingsStore.settings?.parentPin) {
      failPin('current');
      return;
    }
    pinStep.value = 'next';
  } else if (pinStep.value === 'next') {
    nextPin.value = value;
    pinStep.value = 'repeat';
  } else if (value === nextPin.value) {
    await settingsStore.update({ parentPin: value });
    $q.notify({ type: 'positive', message: 'PIN изменён' });
    view.value = 'main';
  } else {
    failPin('next');
    return;
  }
  pin.value = '';
};
</script>
