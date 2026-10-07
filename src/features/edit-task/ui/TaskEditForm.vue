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

    <q-toggle v-if="task" v-model="active" label="Задача включена" color="primary" />

    <ChildrenPicker v-model="childIds" />
    <div v-if="task" class="text-caption text-grey-5">Правка действует с сегодняшнего дня, прошлые серии не изменятся</div>

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
import { todayKey } from '@/shared/lib/date';
import ColorPicker from '@/shared/ui/ColorPicker.vue';
import IconPicker from '@/shared/ui/IconPicker.vue';
import { COLOR_PALETTE, ICON_CHOICES } from '@/shared/ui/constants';
import { ChildrenPicker } from '@/entities/child';
import { createTask, updateTask, setTaskActive, assignTask, archiveTask, type Task } from '@/entities/task';

const props = withDefaults(defineProps<{ task?: Task | null }>(), { task: null });
const emit = defineEmits<{ done: []; cancel: [] }>();

const $q = useQuasar();

const name = ref('');
const points = ref(1);
const icon = ref<string>(ICON_CHOICES[0]);
const color = ref<string>(COLOR_PALETTE[2]);
const active = ref(true);
const childIds = ref<string[] | null>(null);

const canSave = computed(
  () =>
    name.value.trim().length > 0 &&
    Number.isInteger(points.value) &&
    points.value > 0 &&
    (childIds.value === null || childIds.value.length > 0)
);

const reset = (): void => {
  name.value = props.task?.name ?? '';
  points.value = props.task?.points ?? 1;
  icon.value = props.task?.icon ?? ICON_CHOICES[0];
  color.value = props.task?.color ?? COLOR_PALETTE[2];
  active.value = props.task?.active ?? true;
  childIds.value = props.task?.childIds ? [...props.task.childIds] : null;
};

onMounted(reset);

const save = async (): Promise<void> => {
  const today = todayKey();
  const draft = { name: name.value.trim(), points: points.value, icon: icon.value, color: color.value };
  const children = childIds.value ?? undefined;
  if (props.task) {
    await updateTask(props.task.id, draft);
    await assignTask(props.task.id, children, today);
    await setTaskActive(props.task.id, active.value, today);
  } else {
    await createTask(draft, today, children);
  }
  emit('done');
};

const remove = (): void => {
  const task = props.task;
  if (!task) {
    return;
  }
  $q.dialog({
    title: 'Удалить задачу',
    message: `«${task.name}» пропадёт из списка. Начисленные баллы и прошлые серии не изменятся.`,
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
