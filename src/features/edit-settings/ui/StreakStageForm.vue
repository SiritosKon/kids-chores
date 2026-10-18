<template>
  <div class="form-stack">
    <q-input
      v-model.number="draft.days"
      type="number"
      inputmode="numeric"
      :label="t('editSettings.stageDays')"
      :min="STREAK_MIN_DAYS"
      :error="daysTaken"
      :error-message="t('editSettings.stageDaysTaken')"
    />
    <RewardSelect
      :model-value="draft.rewardId"
      :label="t('editSettings.reward')"
      :visibilities="PRIZE_VISIBILITIES"
      @update:model-value="draft.rewardId = $event"
      @create="emit('create-reward')"
    />
    <q-input
      v-model.number="draft.points"
      type="number"
      inputmode="numeric"
      :label="t('editSettings.points')"
      :min="0"
      :hint="t('editSettings.stageHint')"
    />
    <div v-if="!hasPrize" class="text-negative text-caption">{{ t('editSettings.prizeRequired') }}</div>

    <ChildrenPicker :model-value="chosenChildren ?? null" @update:model-value="chooseChildren" />

    <div class="row items-center q-mt-md">
      <q-btn v-if="stage" flat no-caps color="negative" icon="delete" :label="t('editSettings.removeStage')" @click="remove" />
      <q-space />
      <q-btn unelevated no-caps color="primary" :label="t('common.save')" :disable="!canSave" @click="save" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { todayKey } from '@/shared/lib/date';
import { ChildrenPicker } from '@/entities/child';
import { RewardSelect, PRIZE_VISIBILITIES } from '@/entities/reward';
import {
  useSettingsStore,
  addMilestone,
  changeMilestone,
  removeMilestone,
  isStageDaysTaken,
  type StreakMilestone,
} from '@/entities/settings';
import { STREAK_MIN_DAYS } from '../model/constants';
import { useStageDraftStore } from '../model/store';

const props = withDefaults(defineProps<{ stage?: StreakMilestone | null }>(), { stage: null });
const emit = defineEmits<{ changed: []; 'create-reward': [] }>();

const $q = useQuasar();
const { t } = useI18n();
const settingsStore = useSettingsStore();
const { draft } = storeToRefs(useStageDraftStore());

const chooseChildren = (childIds: string[] | null): void => {
  draft.value.forEveryone = childIds === null;
  draft.value.childIds = childIds ?? [];
};

const chosenChildren = computed(() => (draft.value.forEveryone ? undefined : draft.value.childIds));

const isCount = (value: number, min: number): boolean => Number.isInteger(value) && value >= min;

const hasPrize = computed(() => draft.value.rewardId !== null || draft.value.points > 0);

const daysTaken = computed(() =>
  isStageDaysTaken(settingsStore.streak.milestones, draft.value.days, chosenChildren.value, props.stage?.id ?? null)
);

const canSave = computed(
  () =>
    isCount(draft.value.days, STREAK_MIN_DAYS) &&
    isCount(draft.value.points, 0) &&
    hasPrize.value &&
    !daysTaken.value &&
    (draft.value.forEveryone || draft.value.childIds.length > 0)
);

const store = async (milestones: StreakMilestone[]): Promise<void> => {
  await settingsStore.update({ streak: { ...settingsStore.streak, milestones } });
  emit('changed');
};

const save = async (): Promise<void> => {
  const rule = {
    days: draft.value.days,
    ...(draft.value.points > 0 ? { points: draft.value.points } : {}),
    ...(draft.value.rewardId ? { rewardId: draft.value.rewardId } : {}),
    ...(chosenChildren.value ? { childIds: chosenChildren.value } : {}),
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
    title: t('editSettings.removeStage'),
    message: t('editSettings.removeStageMessage', { days: t('editSettings.stageDaysInRow', stage.days) }),
    cancel: { flat: true, noCaps: true, label: t('common.cancel') },
    ok: { flat: true, noCaps: true, color: 'negative', label: t('common.delete') },
    persistent: true,
  }).onOk(() => store(removeMilestone(settingsStore.streak.milestones, stage.id, todayKey())));
};
</script>
