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

<script setup lang="ts">
import { toRef } from 'vue';
import { CHILDREN } from '@/entities/child';
import { REGULAR_TASKS, BONUS_TASK } from '@/entities/task';
import { useDayMarks } from '../model/useDayMarks';

const props = defineProps<{ selectedDate: string }>();

const children = CHILDREN;
const regularTasks = REGULAR_TASKS;
const bonusTask = BONUS_TASK;

const CHECK_COLORS = ['blue', 'red'];

const { isChecked, bonusEarned, toggle, dirty, accept } = useDayMarks(toRef(props, 'selectedDate'));

function checkColor(index: number): string {
  return CHECK_COLORS[index] ?? 'primary';
}
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
