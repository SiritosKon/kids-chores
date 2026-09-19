<template>
  <div class="tasks-board">
    <div v-if="!ready" class="ios-card board-stub">
      <q-skeleton type="text" width="40%" />
      <q-skeleton type="text" width="70%" />
      <q-skeleton type="text" width="55%" />
    </div>

    <div v-else-if="children.length === 0" class="ios-card board-stub text-grey-5">
      Детей пока нет. Добавьте ребёнка в родительском режиме.
    </div>

    <div v-else-if="regularTasks.length === 0" class="ios-card board-stub text-grey-5">
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
        <div class="task-info">
          <div>{{ task.name }}</div>
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

      <div v-if="bonus.enabled" class="task-row bonus-row">
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
    </div>

    <div v-if="ready && children.length > 0 && regularTasks.length > 0" class="row justify-end q-mt-md">
      <q-btn color="primary" rounded unelevated icon="check" label="Принять" class="text-weight-bold" :disable="!dirty" @click="accept" />
    </div>

    <StreakAwardDialog
      :model-value="grantedAwards.length > 0"
      :awards="grantedAwards"
      @update:model-value="clearAwards"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue';
import { useChildrenStore } from '@/entities/child';
import { useTasksStore, reservedTaskName, BONUS_TASK_ID } from '@/entities/task';
import { useSettingsStore } from '@/entities/settings';
import { StreakAwardDialog } from '@/features/celebrate-streak';
import { useDayMarks } from '../model/useDayMarks';

const props = defineProps<{ selectedDate: string }>();

const childrenStore = useChildrenStore();
const tasksStore = useTasksStore();
const settingsStore = useSettingsStore();

const ready = computed(() => childrenStore.loaded && tasksStore.loaded && settingsStore.loaded);

const BONUS_ROW = {
  name: reservedTaskName(BONUS_TASK_ID) ?? 'Бонус',
  icon: 'star',
  color: '#FF9F0A',
};

const CHECK_COLORS = ['blue', 'red'];

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
