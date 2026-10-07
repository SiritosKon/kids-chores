import { ref, computed, watch, onMounted, type Ref } from 'vue';
import { useQuasar } from 'quasar';
import { celebrate, celebrateStreak } from '@/shared/lib/confetti';
import { useChildrenStore, type Child } from '@/entities/child';
import {
  useTasksStore,
  tasksRequiredOn,
  isTaskRequiredOn,
  questsOpenOn,
  isQuestOpenOn,
  BONUS_TASK_ID,
  type Task,
} from '@/entities/task';
import { useSettingsStore } from '@/entities/settings';
import { useParentSessionStore } from '@/entities/parent-session';
import { getDayCompletions, getTaskCompletions, saveDayMarks, type TaskMark } from '@/entities/completion';
import { recalculateStreaks, type StreakAward } from '@/features/track-streak';
import type { MarksByChild, QuestDoneDays, QuestState } from './types';

export const useDayMarks = (selectedDate: Ref<string>) => {
  const $q = useQuasar();
  const childrenStore = useChildrenStore();
  const tasksStore = useTasksStore();
  const settingsStore = useSettingsStore();
  const parentSession = useParentSessionStore();

  const children = computed(() => childrenStore.active);
  const tasks = computed(() => tasksRequiredOn(tasksStore.items, selectedDate.value));
  const quests = computed(() => questsOpenOn(tasksStore.items, selectedDate.value));
  const bonus = computed(() => settingsStore.bonus);

  const grantedAwards = ref<StreakAward[]>([]);
  const saved = ref<MarksByChild>({});
  const checked = ref<MarksByChild>({});
  const questDone = ref<QuestDoneDays>({});

  const marksOf = (source: MarksByChild, childId: string): Set<string> =>
    source[childId] ?? new Set<string>();

  const requiredFor = (childId: string): Task[] =>
    tasks.value.filter((task) => isTaskRequiredOn(task, selectedDate.value, childId));

  const isAssigned = (childId: string, taskId: string): boolean =>
    requiredFor(childId).some((task) => task.id === taskId);

  const isDoneElsewhere = (childId: string, questId: string): boolean => {
    const day = questDone.value[childId]?.[questId];
    return day !== undefined && day !== selectedDate.value;
  };

  const questState = (childId: string, questId: string): QuestState => {
    const quest = quests.value.find((row) => row.id === questId);
    if (!quest || !isQuestOpenOn(quest, selectedDate.value, childId)) {
      return 'none';
    }
    return isDoneElsewhere(childId, questId) ? 'done' : 'open';
  };

  const markableFor = (childId: string): Task[] => [
    ...requiredFor(childId),
    ...quests.value.filter((quest) => questState(childId, quest.id) === 'open'),
  ];

  const isChecked = (childId: string, taskId: string): boolean =>
    marksOf(checked.value, childId).has(taskId);

  const isLocked = (childId: string, taskId: string): boolean =>
    !parentSession.active && marksOf(saved.value, childId).has(taskId);

  const closesDay = (source: MarksByChild, childId: string): boolean => {
    const marks = marksOf(source, childId);
    const required = requiredFor(childId);
    return required.length > 0 && required.every((task) => marks.has(task.id));
  };

  const bonusEarned = (childId: string): boolean =>
    bonus.value.enabled && closesDay(checked.value, childId);

  const dirty = computed(() =>
    children.value.some((child) => {
      const current = marksOf(checked.value, child.id);
      const stored = marksOf(saved.value, child.id);
      return current.size !== stored.size || [...current].some((id) => !stored.has(id));
    })
  );

  const toggle = (childId: string, taskId: string, isOn: boolean): void => {
    const marks = new Set(marksOf(checked.value, childId));
    if (isOn) {
      marks.add(taskId);
    } else {
      marks.delete(taskId);
    }
    checked.value = { ...checked.value, [childId]: marks };
  };

  const load = async (): Promise<void> => {
    const questIds = quests.value.map((quest) => quest.id);
    const nextDone: QuestDoneDays = {};
    for (const child of children.value) {
      const rows = await getTaskCompletions(child.id, questIds);
      nextDone[child.id] = Object.fromEntries(rows.map((row) => [row.taskId, row.date]));
    }
    questDone.value = nextDone;

    const nextSaved: MarksByChild = {};
    const nextChecked: MarksByChild = {};
    for (const child of children.value) {
      const taskIds = new Set(markableFor(child.id).map((task) => task.id));
      const rows = await getDayCompletions(child.id, selectedDate.value);
      const marks = new Set(rows.map((row) => row.taskId).filter((id) => taskIds.has(id)));
      nextSaved[child.id] = marks;
      nextChecked[child.id] = new Set(marks);
    }
    saved.value = nextSaved;
    checked.value = nextChecked;
  };

  const accept = async (): Promise<void> => {
    const closedNow: Child[] = [];
    for (const child of children.value) {
      if (closesDay(checked.value, child.id) && !closesDay(saved.value, child.id)) {
        closedNow.push(child);
      }
      const earnsBonus = bonusEarned(child.id);

      const marks: TaskMark[] = markableFor(child.id)
        .filter((task) => isChecked(child.id, task.id))
        .map((task) => ({ taskId: task.id, points: task.points }));
      if (earnsBonus) {
        marks.push({ taskId: BONUS_TASK_ID, points: bonus.value.points });
      }
      await saveDayMarks(child.id, selectedDate.value, marks);
    }

    grantedAwards.value = await recalculateStreaks();
    await load();
    $q.notify({ type: 'positive', message: 'Сохранено' });
    if (!parentSession.active) {
      if (grantedAwards.value.length > 0) {
        celebrateStreak();
      } else if (closedNow.length > 0) {
        celebrate(closedNow.map((child) => child.carColor));
      }
    }
  };

  watch([selectedDate, children, tasks, quests], load);
  onMounted(load);

  const clearAwards = (): void => {
    grantedAwards.value = [];
  };

  return {
    children,
    tasks,
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
  };
};
