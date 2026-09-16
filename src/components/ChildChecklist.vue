<template>
  <div class="child-checklist">
    <div class="row items-center q-gutter-sm q-mb-md">
      <q-btn round flat dense icon="event" color="primary" aria-label="Выбрать дату">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-date
            :model-value="selectedDate"
            mask="YYYY-MM-DD"
            :options="dateOptions"
            @update:model-value="onDatePick"
          />
        </q-popup-proxy>
      </q-btn>
      <span class="text-weight-medium">{{ selectedDateLabel }}</span>
      <q-badge v-if="parentActive" color="orange" text-color="black" label="Родительский режим" />
    </div>

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
import { todayKey, weekDayKeys } from '../composables/useWeek.js';

const props = defineProps({
  child: { type: Object, required: true },
});

const $q = useQuasar();
const { active: parentActive } = useParentMode();
const tasks = TASKS;

const selectedDate = ref(todayKey());
const saved = ref(new Set());
const checked = ref(new Set());

const weekSlashKeys = computed(() => new Set(weekDayKeys(new Date()).map((key) => key.replace(/-/g, '/'))));

const selectedDateLabel = computed(() => {
  const [year, month, day] = selectedDate.value.split('-');
  return `${day}.${month}.${year}`;
});

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

function dateOptions(dateStr) {
  if (parentActive.value) {
    return true;
  }
  return weekSlashKeys.value.has(dateStr);
}

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

function onDatePick(value) {
  if (value) {
    selectedDate.value = value;
  }
}

async function load() {
  const rows = await getDayCompletions(props.child.id, selectedDate.value);
  const ids = new Set(rows.map((row) => row.taskId));
  saved.value = ids;
  checked.value = new Set(ids);
}

async function accept() {
  await saveDayMarks(props.child.id, selectedDate.value, [...checked.value]);
  await load();
  $q.notify({ type: 'positive', message: 'Сохранено' });
}

watch(selectedDate, load);
onMounted(load);
</script>
