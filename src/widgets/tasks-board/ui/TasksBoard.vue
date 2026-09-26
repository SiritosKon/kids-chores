<template>
  <div class="tasks-board">
    <div v-if="!ready" class="ios-card board-stub">
      <q-skeleton type="text" width="40%" />
      <q-skeleton type="text" width="70%" />
      <q-skeleton type="text" width="55%" />
    </div>

    <div v-else-if="children.length === 0 && !parentActive" class="ios-card board-stub text-grey-5">
      Детей пока нет. Добавьте ребёнка в родительском режиме.
    </div>

    <div v-else-if="regularTasks.length === 0 && !parentActive" class="ios-card board-stub text-grey-5">
      Задач пока нет. Добавьте задачи в родительском режиме.
    </div>

    <div v-else class="ios-card">
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
        <div class="task-info" :class="{ 'task-info--editable': parentActive }" @click="openEditor(task)">
          <div>
            {{ task.name }}
            <q-icon v-if="parentActive" name="edit" size="14px" color="grey-5" class="q-ml-xs" />
          </div>
          <div class="task-points">{{ task.points }} б.</div>
        </div>
        <div v-for="(child, index) in children" :key="child.id" class="tasks-col">
          <q-checkbox
            :model-value="isChecked(child.id, task.id)"
            :disable="isLocked(child.id, task.id)"
            :color="checkColor(index)"
            checked-icon="check_circle"
            unchecked-icon="radio_button_unchecked"
            @update:model-value="toggle(child.id, task.id, $event)"
          />
        </div>
      </div>

      <div v-if="bonus.enabled && regularTasks.length > 0" class="task-row bonus-row">
        <div class="task-tile" :style="{ background: BONUS_ROW.color }">
          <q-icon :name="BONUS_ROW.icon" size="20px" color="white" />
        </div>
        <div class="task-info">
          <div>{{ BONUS_ROW.name }}</div>
          <div class="task-points">+{{ bonus.points }} б. за все задачи дня</div>
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
      <div
        v-for="task in switchedOffTasks"
        :key="task.id"
        class="task-row task-row--off"
        @click="openEditor(task)"
      >
        <div class="task-tile" :style="{ background: task.color }">
          <q-icon :name="task.icon" size="20px" color="white" />
        </div>
        <div class="task-info task-info--editable">
          <div>
            {{ task.name }}
            <q-icon name="edit" size="14px" color="grey-5" class="q-ml-xs" />
          </div>
          <div class="task-points">выключена</div>
        </div>
      </div>

      <div v-if="parentActive" class="task-row">
        <button type="button" class="add-tile" data-tour="add-task" @click="openEditor(null)">
          <q-icon name="add" size="22px" />
          Добавить задачу
        </button>
      </div>
    </div>

    <div v-if="ready && children.length > 0 && regularTasks.length > 0" class="row justify-end q-mt-md">
      <q-btn color="primary" rounded unelevated icon="check" label="Принять" class="text-weight-bold" :disable="!dirty" @click="accept" />
    </div>

    <StreakAwardDialog
      :model-value="grantedAwards.length > 0"
      :awards="grantedAwards"
      @update:model-value="clearAwards"
    />
    <TaskEditDialog v-model="editorOpen" :task="editedTask" @changed="onTasksChanged" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, toRef } from 'vue';
import { storeToRefs } from 'pinia';
import { useChildrenStore } from '@/entities/child';
import { useTasksStore, type Task } from '@/entities/task';
import { useSettingsStore } from '@/entities/settings';
import { useParentSessionStore } from '@/entities/parent-session';
import { StreakAwardDialog } from '@/features/celebrate-streak';
import { TaskEditDialog } from '@/features/edit-task';
import { recalculateStreaks } from '@/features/track-streak';
import { BONUS_ROW, CHECK_COLORS } from './constants';
import { useDayMarks } from '../model/useDayMarks';

const props = defineProps<{ selectedDate: string }>();

const childrenStore = useChildrenStore();
const tasksStore = useTasksStore();
const settingsStore = useSettingsStore();

const ready = computed(() => childrenStore.loaded && tasksStore.loaded && settingsStore.loaded);

const {
  children,
  tasks: regularTasks,
  bonus,
  grantedAwards,
  clearAwards,
  isChecked,
  isLocked,
  bonusEarned,
  toggle,
  dirty,
  accept,
} = useDayMarks(toRef(props, 'selectedDate'));

const checkColor = (index: number): string => CHECK_COLORS[index] ?? 'primary';

const { active: parentActive } = storeToRefs(useParentSessionStore());

const switchedOffTasks = computed(() =>
  parentActive.value ? tasksStore.kept.filter((task) => !task.active) : []
);

const editorOpen = ref(false);
const editedTask = ref<Task | null>(null);

const openEditor = (task: Task | null): void => {
  if (!parentActive.value) {
    return;
  }
  editedTask.value = task;
  editorOpen.value = true;
};

const onTasksChanged = async (): Promise<void> => {
  await recalculateStreaks();
};
</script>

<style scoped>
.board-stub {
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

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

.task-info--editable {
  cursor: pointer;
}

.task-row--off {
  opacity: 0.5;
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
