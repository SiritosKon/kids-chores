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

    <div v-else-if="!hasRows && !parentActive" class="ios-card board-stub text-grey-5">
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
            v-if="isAssigned(child.id, task.id)"
            :model-value="isChecked(child.id, task.id)"
            :disable="isLocked(child.id, task.id)"
            :color="checkColor(index)"
            checked-icon="check_circle"
            unchecked-icon="radio_button_unchecked"
            @update:model-value="toggle(child.id, task.id, $event)"
          />
          <span v-else class="tasks-col__none" aria-label="Не для этого ребёнка">—</span>
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
      <template v-if="quests.length > 0">
        <div class="quests-head">Квесты</div>
        <div v-for="quest in quests" :key="quest.id" class="task-row">
          <div class="task-tile" :style="{ background: quest.color }">
            <q-icon :name="quest.icon" size="20px" color="white" />
          </div>
          <div class="task-info" :class="{ 'task-info--editable': parentActive }" @click="openEditor(quest)">
            <div>
              {{ quest.name }}
              <q-icon v-if="parentActive" name="edit" size="14px" color="grey-5" class="q-ml-xs" />
            </div>
            <div class="task-points">
              +{{ quest.points }} б. · {{ questDeadlineLabel(questDeadline(quest), selectedDate) }}
            </div>
          </div>
          <div v-for="(child, index) in children" :key="child.id" class="tasks-col">
            <q-checkbox
              v-if="questState(child.id, quest.id) === 'open'"
              :model-value="isChecked(child.id, quest.id)"
              :disable="isLocked(child.id, quest.id)"
              :color="checkColor(index)"
              checked-icon="check_circle"
              unchecked-icon="radio_button_unchecked"
              @update:model-value="toggle(child.id, quest.id, $event)"
            />
            <q-checkbox
              v-else-if="questState(child.id, quest.id) === 'done'"
              :model-value="true"
              disable
              :color="checkColor(index)"
              checked-icon="check_circle"
            />
            <span v-else class="tasks-col__none" aria-label="Не для этого ребёнка">—</span>
          </div>
        </div>
      </template>

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

    <div v-if="ready && children.length > 0 && hasRows" class="row justify-end q-mt-md">
      <q-btn color="primary" rounded unelevated icon="check" label="Принять" class="text-weight-bold" :disable="!dirty" @click="accept" />
    </div>

    <StreakAwardDialog
      :model-value="grantedAwards.length > 0"
      :awards="grantedAwards"
      @update:model-value="closeAwards"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { NEW_TASK_ID } from '@/shared/config/constants';
import { taskPath } from '@/shared/lib/routes';
import { useChildrenStore } from '@/entities/child';
import { useTasksStore, questDeadline, type Task } from '@/entities/task';
import { useRewardsStore } from '@/entities/reward';
import { useSettingsStore } from '@/entities/settings';
import { useParentSessionStore } from '@/entities/parent-session';
import { StreakAwardDialog } from '@/features/celebrate-streak';
import { useChooseVariant } from '@/features/choose-reward-variant';
import { BONUS_ROW, CHECK_COLORS } from './constants';
import { useDayMarks } from '../model/useDayMarks';
import { questDeadlineLabel } from '../lib/questDeadline';

const props = defineProps<{ selectedDate: string }>();

const childrenStore = useChildrenStore();
const tasksStore = useTasksStore();
const settingsStore = useSettingsStore();

const ready = computed(() => childrenStore.loaded && tasksStore.loaded && settingsStore.loaded);

const {
  children,
  tasks: regularTasks,
  quests,
  bonus,
  grantedAwards,
  clearAwards,
  isAssigned,
  questState,
  isChecked,
  isLocked,
  bonusEarned,
  toggle,
  dirty,
  accept,
} = useDayMarks(toRef(props, 'selectedDate'));

const rewardsStore = useRewardsStore();
const { chooseInTurn } = useChooseVariant();

const closeAwards = async (): Promise<void> => {
  const awards = grantedAwards.value.flatMap((award) =>
    award.rewardId && rewardsStore.hasVariants(award.rewardId)
      ? [{ id: award.id, childId: award.childId, rewardId: award.rewardId }]
      : []
  );
  clearAwards();
  await chooseInTurn(awards);
};

const hasRows = computed(() => regularTasks.value.length > 0 || quests.value.length > 0);

const checkColor = (index: number): string => CHECK_COLORS[index] ?? 'primary';

const { active: parentActive } = storeToRefs(useParentSessionStore());

const switchedOffTasks = computed(() =>
  parentActive.value ? tasksStore.kept.filter((task) => !task.active) : []
);

const router = useRouter();

const openEditor = (task: Task | null): void => {
  if (parentActive.value) {
    void router.push(taskPath(task?.id ?? NEW_TASK_ID));
  }
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

.quests-head {
  padding: 10px 16px 6px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #8e8e93;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.tasks-col__none {
  color: #48484a;
  font-size: 18px;
  line-height: 40px;
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
