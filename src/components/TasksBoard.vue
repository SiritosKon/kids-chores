<template>
  <div class="tasks-board">
    <div class="ios-card">
      <div class="tasks-head">
        <div class="tasks-head__spacer"></div>
        <div
          v-for="child in children"
          :key="child.id"
          class="tasks-col"
          :style="{ color: child.carColor }"
        >
          {{ child.name }}
        </div>
      </div>
      <q-separator />

      <div v-for="task in regularTasks" :key="task.id" class="task-row">
        <div class="task-tile" :style="{ background: task.color }">
          <q-icon :name="task.icon" size="20px" color="white" />
        </div>
        <div class="task-info">
          <div>{{ task.name }}</div>
          <div class="task-points">{{ task.points }} б.</div>
        </div>
        <div v-for="(child, index) in children" :key="child.id" class="tasks-col">
          <q-checkbox
            :model-value="isChecked(child.id, task.id)"
            :color="checkColor(index)"
            checked-icon="check_circle"
            unchecked-icon="radio_button_unchecked"
            @update:model-value="toggle(child.id, task.id, $event)"
          />
        </div>
      </div>

      <div v-if="bonusTask" class="task-row bonus-row">
        <div class="task-tile" :style="{ background: bonusTask.color }">
          <q-icon :name="bonusTask.icon" size="20px" color="white" />
        </div>
        <div class="task-info">
          <div>{{ bonusTask.name }}</div>
          <div class="task-points">+{{ bonusTask.points }} б. за все задачи дня</div>
        </div>
        <div v-for="(child, index) in children" :key="child.id" class="tasks-col">
          <q-checkbox
            :model-value="bonusEarned(child.id)"
            disable
            :color="checkColor(index)"
            checked-icon="check_circle"
            unchecked-icon="radio_button_unchecked"
          />
        </div>
      </div>
    </div>

    <div class="row justify-end q-mt-md">
      <q-btn color="primary" rounded unelevated icon="check" label="Принять" class="text-weight-bold" :disable="!dirty" @click="accept" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { celebrate } from '@/shared/lib/confetti';
import { CHILDREN } from '@/entities/child';
import { REGULAR_TASKS, BONUS_TASK, BONUS_TASK_ID } from '@/entities/task';
import { getDayCompletions, saveDayMarks } from '@/entities/completion';

const props = defineProps({
  selectedDate: { type: String, required: true },
});

const $q = useQuasar();
const children = CHILDREN;

const regularTasks = REGULAR_TASKS;
const bonusTask = BONUS_TASK;

const CHECK_COLORS = ['blue', 'red'];

const saved = ref({});
const checked = ref({});

function checkColor(index) {
  return CHECK_COLORS[index] || 'primary';
}

function isChecked(childId, taskId) {
  return Boolean(checked.value[childId] && checked.value[childId].has(taskId));
}

function bonusEarned(childId) {
  const set = checked.value[childId];
  if (!set || regularTasks.length === 0) {
    return false;
  }
  return regularTasks.every((task) => set.has(task.id));
}

const dirty = computed(() => {
  for (const child of children) {
    const current = checked.value[child.id] || new Set();
    const stored = saved.value[child.id] || new Set();
    if (current.size !== stored.size) {
      return true;
    }
    for (const id of current) {
      if (!stored.has(id)) {
        return true;
      }
    }
  }
  return false;
});

function toggle(childId, taskId, isOn) {
  const nextChecked = { ...checked.value };
  const set = new Set(nextChecked[childId]);
  if (isOn) {
    set.add(taskId);
  } else {
    set.delete(taskId);
  }
  nextChecked[childId] = set;
  checked.value = nextChecked;
}

async function load() {
  const regularIds = new Set(regularTasks.map((task) => task.id));
  const nextSaved = {};
  const nextChecked = {};
  for (const child of children) {
    const rows = await getDayCompletions(child.id, props.selectedDate);
    const savedRegular = new Set(rows.map((row) => row.taskId).filter((id) => regularIds.has(id)));
    nextSaved[child.id] = savedRegular;
    nextChecked[child.id] = new Set(savedRegular);
  }
  saved.value = nextSaved;
  checked.value = nextChecked;
}

async function accept() {
  const celebrated = [];
  for (const child of children) {
    const wasAllBefore = regularTasks.every((task) => (saved.value[child.id] || new Set()).has(task.id));
    const earnsBonus = Boolean(bonusTask) && bonusEarned(child.id);
    if (earnsBonus && !wasAllBefore) {
      celebrated.push(child);
    }
    const marks = regularTasks
      .filter((task) => isChecked(child.id, task.id))
      .map((task) => ({ taskId: task.id, points: task.points }));
    if (earnsBonus && bonusTask) {
      marks.push({ taskId: BONUS_TASK_ID, points: bonusTask.points });
    }
    await saveDayMarks(child.id, props.selectedDate, marks);
  }
  await load();
  $q.notify({ type: 'positive', message: 'Сохранено' });
  for (const child of celebrated) {
    celebrate(child.carColor);
  }
}

watch(() => props.selectedDate, load);
onMounted(load);
</script>

<style scoped>
.tasks-head {
  display: flex;
  align-items: center;
  padding: 8px 16px;
}

.tasks-head__spacer {
  flex: 1 1 auto;
}

.task-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
}

.task-row:not(:last-child) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.bonus-row {
  background: rgba(255, 159, 10, 0.07);
}

.task-tile {
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.task-info {
  flex: 1 1 auto;
  min-width: 0;
}

.task-points {
  font-size: 12px;
  color: #8e8e93;
}

.tasks-col {
  flex: 0 0 auto;
  width: 68px;
  display: flex;
  justify-content: center;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
}
</style>
