<template>
  <div class="form-stack">
    <div class="form-row">
      <div class="task-preview" :style="{ background: color }">
        <q-icon :name="icon" size="26px" color="white" />
      </div>
      <q-input v-model="name" class="col" label="Название" autofocus maxlength="40" />
    </div>

    <q-input
      v-model.number="points"
      type="number"
      inputmode="numeric"
      label="Баллы за выполнение"
      :min="1"
      :hint="task ? 'Уже начисленное не изменится' : undefined"
    />

    <q-toggle v-if="!task" v-model="isQuest" label="Разовый квест" color="primary" />
    <template v-if="isQuest">
      <q-select
        v-model="questTerm"
        :options="QUEST_TERM_OPTIONS"
        label="Срок"
        emit-value
        map-options
        :hint="questError ? undefined : questHint"
      />
      <div v-if="questTerm === 'custom'" class="form-row">
        <q-input v-model="customDates.from" type="date" label="Начало" stack-label class="col" />
        <q-input v-model="customDates.lastDay" type="date" label="Конец" stack-label class="col" />
      </div>
      <div v-if="questError" class="text-negative text-caption">{{ questError }}</div>
    </template>
    <q-toggle v-if="task && !isQuest" v-model="active" label="Задача включена" color="primary" />

    <ChildrenPicker v-model="childIds" />
    <div v-if="task && !isQuest" class="text-caption text-grey-5">
      Правка действует с сегодняшнего дня, прошлые серии не изменятся
    </div>

    <div>
      <div class="text-caption text-grey-5 q-mb-sm">Иконка</div>
      <IconPicker v-model="icon" :color="color" />
    </div>

    <div>
      <div class="text-caption text-grey-5 q-mb-sm">Цвет</div>
      <ColorPicker v-model="color" />
    </div>

    <div class="row items-center q-gutter-sm">
      <q-btn v-if="task" flat no-caps color="negative" icon="delete" label="Удалить" @click="remove" />
      <q-space />
      <q-btn flat no-caps label="Отмена" @click="emit('cancel')" />
      <q-btn unelevated no-caps color="primary" label="Сохранить" :disable="!canSave" @click="save" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { todayKey, formatDayKeyLong } from '@/shared/lib/date';
import ColorPicker from '@/shared/ui/ColorPicker.vue';
import IconPicker from '@/shared/ui/IconPicker.vue';
import { COLOR_PALETTE, ICON_CHOICES } from '@/shared/ui/constants';
import { ChildrenPicker } from '@/entities/child';
import {
  createTask,
  updateTask,
  setTaskActive,
  assignTask,
  updateQuest,
  archiveTask,
  questDates,
  type QuestDates,
  type Task,
} from '@/entities/task';
import { termDates, questDatesError } from '../lib/questTerm';
import { DEFAULT_QUEST_TERM, QUEST_TERM_OPTIONS } from '../model/constants';
import type { QuestTerm } from '../model/types';

const props = withDefaults(defineProps<{ task?: Task | null; asQuest?: boolean }>(), {
  task: null,
  asQuest: false,
});
const emit = defineEmits<{ done: []; cancel: [] }>();

const $q = useQuasar();

const name = ref('');
const points = ref(1);
const icon = ref<string>(ICON_CHOICES[0]);
const color = ref<string>(COLOR_PALETTE[2]);
const active = ref(true);
const childIds = ref<string[] | null>(null);
const isQuest = ref(false);
const questTerm = ref<QuestTerm>(DEFAULT_QUEST_TERM);
const customDates = ref<QuestDates>({ from: todayKey(), lastDay: todayKey() });

const chosenDates = computed(() => termDates(questTerm.value, todayKey(), customDates.value));

const questError = computed(() => (isQuest.value ? questDatesError(chosenDates.value, todayKey()) : null));

const questHint = computed(() => {
  const { from, lastDay } = chosenDates.value;
  const start = from > todayKey() ? `Начнётся: ${formatDayKeyLong(from)}. ` : '';
  return `${start}Последний день — ${formatDayKeyLong(lastDay)}. Не успел — квест сгорает. В серию и бонус за день не входит`;
});

const canSave = computed(
  () =>
    name.value.trim().length > 0 &&
    Number.isInteger(points.value) &&
    points.value > 0 &&
    questError.value === null &&
    (childIds.value === null || childIds.value.length > 0)
);

const reset = (): void => {
  name.value = props.task?.name ?? '';
  points.value = props.task?.points ?? 1;
  icon.value = props.task?.icon ?? ICON_CHOICES[0];
  color.value = props.task?.color ?? COLOR_PALETTE[2];
  active.value = props.task?.active ?? true;
  childIds.value = props.task?.childIds ? [...props.task.childIds] : null;
  isQuest.value = props.task ? props.task.quest === true : props.asQuest;
  const stored = props.task ? questDates(props.task) : undefined;
  questTerm.value = stored ? 'custom' : DEFAULT_QUEST_TERM;
  customDates.value = stored ?? termDates(DEFAULT_QUEST_TERM, todayKey(), customDates.value);
};

onMounted(reset);

const save = async (): Promise<void> => {
  const today = todayKey();
  const draft = { name: name.value.trim(), points: points.value, icon: icon.value, color: color.value };
  const children = childIds.value ?? undefined;
  if (props.task?.quest) {
    await updateTask(props.task.id, draft);
    await updateQuest(props.task.id, chosenDates.value, children);
  } else if (props.task) {
    await updateTask(props.task.id, draft);
    await assignTask(props.task.id, children, today);
    await setTaskActive(props.task.id, active.value, today);
  } else {
    await createTask(draft, today, {
      ...(children ? { childIds: children } : {}),
      ...(isQuest.value ? { quest: chosenDates.value } : {}),
    });
  }
  emit('done');
};

const remove = (): void => {
  const task = props.task;
  if (!task) {
    return;
  }
  $q.dialog({
    title: task.quest ? 'Удалить квест' : 'Удалить задачу',
    message: task.quest
      ? `«${task.name}» пропадёт с доски. Начисленные баллы останутся.`
      : `«${task.name}» пропадёт из списка. Начисленные баллы и прошлые серии не изменятся.`,
    cancel: { flat: true, noCaps: true, label: 'Отмена' },
    ok: { flat: true, noCaps: true, color: 'negative', label: 'Удалить' },
    persistent: true,
  }).onOk(async () => {
    await archiveTask(task.id, todayKey());
    emit('done');
  });
};
</script>

<style scoped>
.task-preview {
  flex: 0 0 auto;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
