<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" @before-show="reset">
    <q-card class="dialog--form">
      <q-card-section class="row items-center">
        <div class="text-h6">{{ stage ? 'Этап серии' : 'Новый этап' }}</div>
        <q-space />
        <q-btn flat round dense icon="close" v-close-popup aria-label="Закрыть" />
      </q-card-section>
      <q-separator />

      <q-card-section class="form-stack">
        <q-input
          v-model.number="days"
          type="number"
          inputmode="numeric"
          label="Сколько дней подряд"
          :min="STREAK_MIN_DAYS"
          :error="daysTaken"
          error-message="Этап с таким числом дней уже есть"
          autofocus
        />
        <q-select
          :model-value="rewardId"
          :options="rewardOptions"
          label="Награда"
          emit-value
          map-options
          clearable
          @update:model-value="pickReward"
        />
        <q-input
          v-model.number="points"
          type="number"
          inputmode="numeric"
          label="Баллы"
          :min="0"
          hint="Приз выдаётся один раз за серию. Правка действует с сегодняшнего дня"
        />
        <div v-if="!hasPrize" class="text-negative text-caption">Укажите награду или баллы</div>
      </q-card-section>

      <q-separator />
      <q-card-actions>
        <q-btn v-if="stage" flat no-caps color="negative" icon="delete" label="Удалить" @click="remove" />
        <q-space />
        <q-btn flat no-caps label="Отмена" v-close-popup />
        <q-btn unelevated no-caps color="primary" label="Сохранить" :disable="!canSave" @click="save" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { todayKey } from '@/shared/lib/date';
import { DAY_WORD_FORMS } from '@/shared/lib/constants';
import { pluralize } from '@/shared/lib/plural';
import { useRewardsStore } from '@/entities/reward';
import {
  useSettingsStore,
  addMilestone,
  changeMilestone,
  removeMilestone,
  isStageDaysTaken,
  type StreakMilestone,
} from '@/entities/settings';
import { NEW_REWARD_OPTION, STREAK_MIN_DAYS } from '../model/constants';

const props = withDefaults(
  defineProps<{
    modelValue?: boolean;
    stage?: StreakMilestone | null;
    pickedRewardId?: string | null;
  }>(),
  { modelValue: false, stage: null, pickedRewardId: null }
);
const emit = defineEmits<{ 'update:modelValue': [open: boolean]; changed: []; 'create-reward': [] }>();

const $q = useQuasar();
const settingsStore = useSettingsStore();
const rewardsStore = useRewardsStore();

const days = ref(7);
const points = ref(0);
const rewardId = ref<string | null>(null);

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
  rewardId.value = value;
};

watch(
  () => props.pickedRewardId,
  (picked) => {
    if (picked) {
      rewardId.value = picked;
    }
  }
);

const isCount = (value: number, min: number): boolean => Number.isInteger(value) && value >= min;

const hasPrize = computed(() => rewardId.value !== null || points.value > 0);

const daysTaken = computed(() =>
  isStageDaysTaken(settingsStore.streak.milestones, days.value, props.stage?.id ?? null)
);

const canSave = computed(
  () => isCount(days.value, STREAK_MIN_DAYS) && isCount(points.value, 0) && hasPrize.value && !daysTaken.value
);

const reset = (): void => {
  days.value = props.stage?.days ?? 7;
  points.value = props.stage?.points ?? 0;
  rewardId.value = props.stage?.rewardId ?? null;
};

const store = async (milestones: StreakMilestone[]): Promise<void> => {
  await settingsStore.update({ streak: { ...settingsStore.streak, milestones } });
  emit('changed');
  emit('update:modelValue', false);
};

const save = async (): Promise<void> => {
  const rule = {
    days: days.value,
    ...(points.value > 0 ? { points: points.value } : {}),
    ...(rewardId.value ? { rewardId: rewardId.value } : {}),
  };
  const milestones = settingsStore.streak.milestones;
  await store(
    props.stage
      ? changeMilestone(milestones, props.stage.id, rule, todayKey(), crypto.randomUUID())
      : addMilestone(milestones, rule, todayKey(), crypto.randomUUID())
  );
};

const remove = (): void => {
  const stage = props.stage;
  if (!stage) {
    return;
  }
  $q.dialog({
    title: 'Удалить этап',
    message: `Этап «${stage.days} ${pluralize(stage.days, DAY_WORD_FORMS)} подряд» пропадёт. Уже выданные призы останутся в истории.`,
    cancel: { flat: true, noCaps: true, label: 'Отмена' },
    ok: { flat: true, noCaps: true, color: 'negative', label: 'Удалить' },
    persistent: true,
  }).onOk(() => store(removeMilestone(settingsStore.streak.milestones, stage.id, todayKey())));
};
</script>
