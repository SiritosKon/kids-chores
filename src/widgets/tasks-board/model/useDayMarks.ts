import { ref, computed, watch, onMounted, type Ref } from 'vue';
import { useQuasar } from 'quasar';
import { celebrate } from '@/shared/lib/confetti';
import { useChildrenStore, type Child } from '@/entities/child';
import { useTasksStore, BONUS_TASK_ID } from '@/entities/task';
import { useSettingsStore } from '@/entities/settings';
import { getDayCompletions, saveDayMarks, type TaskMark } from '@/entities/completion';

type MarksByChild = Record<string, Set<string>>;

export const useDayMarks = (selectedDate: Ref<string>) => {
  const $q = useQuasar();
  const childrenStore = useChildrenStore();
  const tasksStore = useTasksStore();
  const settingsStore = useSettingsStore();

  const children = computed(() => childrenStore.active);
  const tasks = computed(() => tasksStore.active);
  const bonus = computed(() => settingsStore.settings.bonus);

  const saved = ref<MarksByChild>({});
  const checked = ref<MarksByChild>({});

  const marksOf = (source: MarksByChild, childId: string): Set<string> =>
    source[childId] ?? new Set<string>();

  const isChecked = (childId: string, taskId: string): boolean =>
    marksOf(checked.value, childId).has(taskId);

  const bonusEarned = (childId: string): boolean => {
    if (!bonus.value.enabled || tasks.value.length === 0) {
      return false;
    }
    const marks = marksOf(checked.value, childId);
    return tasks.value.every((task) => marks.has(task.id));
  };

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
    const taskIds = new Set(tasks.value.map((task) => task.id));
    const nextSaved: MarksByChild = {};
    const nextChecked: MarksByChild = {};
    for (const child of children.value) {
      const rows = await getDayCompletions(child.id, selectedDate.value);
      const marks = new Set(rows.map((row) => row.taskId).filter((id) => taskIds.has(id)));
      nextSaved[child.id] = marks;
      nextChecked[child.id] = new Set(marks);
    }
    saved.value = nextSaved;
    checked.value = nextChecked;
  };

  const accept = async (): Promise<void> => {
    const celebrated: Child[] = [];
    for (const child of children.value) {
      const stored = marksOf(saved.value, child.id);
      const wasCompleteBefore = tasks.value.every((task) => stored.has(task.id));
      const earnsBonus = bonusEarned(child.id);
      if (earnsBonus && !wasCompleteBefore) {
        celebrated.push(child);
      }

      const marks: TaskMark[] = tasks.value
        .filter((task) => isChecked(child.id, task.id))
        .map((task) => ({ taskId: task.id, points: task.points }));
      if (earnsBonus) {
        marks.push({ taskId: BONUS_TASK_ID, points: bonus.value.points });
      }
      await saveDayMarks(child.id, selectedDate.value, marks);
    }

    await load();
    $q.notify({ type: 'positive', message: 'Сохранено' });
    for (const child of celebrated) {
      celebrate(child.carColor);
    }
  };

  watch([selectedDate, children, tasks], load);
  onMounted(load);

  return { children, tasks, bonus, isChecked, bonusEarned, toggle, dirty, accept };
};
