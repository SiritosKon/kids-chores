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
    <q-input
      v-if="isQuest"
      v-model.number="questDays"
      type="number"
      inputmode="numeric"
      label="Сколько дней на выполнение"
      :min="1"
      :max="QUEST_MAX_DAYS"
      :error="!questDaysValid"
      :error-message="`От 1 до ${QUEST_MAX_DAYS} дней`"
      :hint="questHint"
    />
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
import { todayKey, daysBetween, formatDayKeyLong, shiftDayKey } from '@/shared/lib/date';
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
  questDeadline,
  type Task,
} from '@/entities/task';
import { QUEST_DEFAULT_DAYS, QUEST_MAX_DAYS } from '../model/constants';

const props = withDefaults(defineProps<{ task?: Task | null }>(), { task: null });
const emit = defineEmits<{ done: []; cancel: [] }>();

const $q = useQuasar();

const name = ref('');
const points = ref(1);
const icon = ref<string>(ICON_CHOICES[0]);
const color = ref<string>(COLOR_PALETTE[2]);
const active = ref(true);
const childIds = ref<string[] | null>(null);
const isQuest = ref(false);
const questDays = ref(QUEST_DEFAULT_DAYS);

const questStart = computed(() => props.task?.activePeriods[0]?.from ?? todayKey());

const questDaysValid = computed(
  () =>
    !isQuest.value ||
    (Number.isInteger(questDays.value) && questDays.value >= 1 && questDays.value <= QUEST_MAX_DAYS)
);

const questHint = computed(() => {
  if (!questDaysValid.value) {
    return undefined;
  }
  const lastDay = formatDayKeyLong(shiftDayKey(questStart.value, questDays.value - 1));
  return `Последний день — ${lastDay}. Не успел — квест сгорает. В серию и бонус за день не входит`;
});

const canSave = computed(
  () =>
    name.value.trim().length > 0 &&
    Number.isInteger(points.value) &&
    points.value > 0 &&
    questDaysValid.value &&
    (childIds.value === null || childIds.value.length > 0)
);

const reset = (): void => {
  name.value = props.task?.name ?? '';
  points.value = props.task?.points ?? 1;
  icon.value = props.task?.icon ?? ICON_CHOICES[0];
  color.value = props.task?.color ?? COLOR_PALETTE[2];
  active.value = props.task?.active ?? true;
  childIds.value = props.task?.childIds ? [...props.task.childIds] : null;
  isQuest.value = props.task?.quest === true;
  const deadline = props.task ? questDeadline(props.task) : undefined;
  questDays.value = deadline ? daysBetween(questStart.value, deadline) : QUEST_DEFAULT_DAYS;
};

onMounted(reset);

const save = async (): Promise<void> => {
  const today = todayKey();
  const draft = { name: name.value.trim(), points: points.value, icon: icon.value, color: color.value };
  const children = childIds.value ?? undefined;
  if (props.task?.quest) {
    await updateTask(props.task.id, draft);
    await updateQuest(props.task.id, questDays.value, children);
  } else if (props.task) {
    await updateTask(props.task.id, draft);
    await assignTask(props.task.id, children, today);
    await setTaskActive(props.task.id, active.value, today);
  } else {
    await createTask(draft, today, {
      ...(children ? { childIds: children } : {}),
      ...(isQuest.value ? { questDays: questDays.value } : {}),
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
