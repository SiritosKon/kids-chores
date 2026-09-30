<template>
  <div class="form-stack">
    <q-input
      v-model.number="draft.days"
      type="number"
      inputmode="numeric"
      label="Сколько дней подряд"
      :min="STREAK_MIN_DAYS"
      :error="daysTaken"
      error-message="У этих детей уже есть этап с таким числом дней"
    />
    <q-select
      :model-value="draft.rewardId"
      :options="rewardOptions"
      label="Награда"
      emit-value
      map-options
      clearable
      @update:model-value="pickReward"
    />
    <q-input
      v-model.number="draft.points"
      type="number"
      inputmode="numeric"
      label="Баллы"
      :min="0"
      hint="Приз выдаётся один раз за серию. Правка действует с сегодняшнего дня"
    />
    <div v-if="!hasPrize" class="text-negative text-caption">Укажите награду или баллы</div>

    <div>
      <div class="text-caption text-grey-5">Для кого</div>
      <q-checkbox
        :model-value="allState"
        label="Все дети"
        color="primary"
        @update:model-value="toggleAll(allState !== true)"
      />
      <div class="children-list">
        <q-checkbox
          v-for="child in childOptions"
          :key="child.value"
          :model-value="isChosen(child.value)"
          :label="child.label"
          color="primary"
          @update:model-value="toggleChild(child.value, $event)"
        />
      </div>
      <div v-if="!draft.forEveryone && draft.childIds.length === 0" class="text-negative text-caption">
        Отметьте хотя бы одного ребёнка
      </div>
    </div>

    <div class="row items-center q-mt-md">
      <q-btn v-if="stage" flat no-caps color="negative" icon="delete" label="Удалить этап" @click="remove" />
      <q-space />
      <q-btn unelevated no-caps color="primary" label="Сохранить" :disable="!canSave" @click="save" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { todayKey } from '@/shared/lib/date';
import { DAY_WORD_FORMS } from '@/shared/lib/constants';
import { pluralize } from '@/shared/lib/plural';
import { useChildrenStore } from '@/entities/child';
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
import { useStageDraftStore } from '../model/store';

const props = withDefaults(defineProps<{ stage?: StreakMilestone | null }>(), { stage: null });
const emit = defineEmits<{ changed: []; 'create-reward': [] }>();

const $q = useQuasar();
const settingsStore = useSettingsStore();
const rewardsStore = useRewardsStore();
const childrenStore = useChildrenStore();
const { draft } = storeToRefs(useStageDraftStore());

const childOptions = computed(() =>
  childrenStore.active.map((child) => ({ value: child.id, label: child.name }))
);

const allState = computed<boolean | null>(() => {
  if (draft.value.forEveryone) {
    return true;
  }
  return draft.value.childIds.length > 0 ? null : false;
});

const isChosen = (childId: string): boolean =>
  draft.value.forEveryone || draft.value.childIds.includes(childId);

const toggleAll = (checked: boolean): void => {
  draft.value.forEveryone = checked;
  draft.value.childIds = [];
};

const toggleChild = (childId: string, checked: boolean): void => {
  const everyone = childOptions.value.map((option) => option.value);
  const current = draft.value.forEveryone ? everyone : draft.value.childIds;
  const next = checked ? [...new Set([...current, childId])] : current.filter((id) => id !== childId);
  const coversEveryone = everyone.every((id) => next.includes(id));
  draft.value.forEveryone = coversEveryone;
  draft.value.childIds = coversEveryone ? [] : next;
};

const chosenChildren = computed(() => (draft.value.forEveryone ? undefined : draft.value.childIds));

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
  draft.value.rewardId = value;
};

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
    title: 'Удалить этап',
    message: `Этап «${stage.days} ${pluralize(stage.days, DAY_WORD_FORMS)} подряд» пропадёт. Уже выданные призы останутся в истории.`,
    cancel: { flat: true, noCaps: true, label: 'Отмена' },
    ok: { flat: true, noCaps: true, color: 'negative', label: 'Удалить' },
    persistent: true,
  }).onOk(() => store(removeMilestone(settingsStore.streak.milestones, stage.id, todayKey())));
};
</script>

<style scoped>
.children-list {
  display: flex;
  flex-direction: column;
  padding-left: 24px;
}
</style>
