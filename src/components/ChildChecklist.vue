<template>
  <div class="child-checklist">
    <q-list separator>
      <TaskRow
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        :checked="checked.has(task.id)"
        :disabled="isLocked(task.id)"
        @update:checked="toggle(task.id, $event)"
      />
    </q-list>

    <div class="row items-center q-mt-md">
      <q-btn color="primary" unelevated icon="check" label="Принять" :disable="!dirty" @click="accept" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import TaskRow from './TaskRow.vue';
import { TASKS } from '../config/tasks.js';
import { useParentMode } from '../composables/useParentMode.js';
import { getDayCompletions, saveDayMarks } from '../db/completionsRepo.js';

const props = defineProps({
  child: { type: Object, required: true },
  selectedDate: { type: String, required: true },
});

const $q = useQuasar();
const { active: parentActive } = useParentMode();
const tasks = TASKS;

const saved = ref(new Set());
const checked = ref(new Set());

const dirty = computed(() => {
  if (checked.value.size !== saved.value.size) {
    return true;
  }
  for (const id of checked.value) {
    if (!saved.value.has(id)) {
      return true;
    }
  }
  return false;
});

function isLocked(taskId) {
  return !parentActive.value && saved.value.has(taskId);
}

function toggle(taskId, isChecked) {
  const next = new Set(checked.value);
  if (isChecked) {
    next.add(taskId);
  } else {
    next.delete(taskId);
  }
  checked.value = next;
}

async function load() {
  const rows = await getDayCompletions(props.child.id, props.selectedDate);
  const ids = new Set(rows.map((row) => row.taskId));
  saved.value = ids;
  checked.value = new Set(ids);
}

async function accept() {
  await saveDayMarks(props.child.id, props.selectedDate, [...checked.value]);
  await load();
  $q.notify({ type: 'positive', message: 'Сохранено' });
}

watch(() => props.selectedDate, load);
onMounted(load);
</script>
