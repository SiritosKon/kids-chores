import { ref, computed, watch, onMounted, type Ref } from 'vue';
import { useQuasar } from 'quasar';
import { celebrate } from '@/shared/lib/confetti';
import { CHILDREN, type Child } from '@/entities/child';
import { REGULAR_TASKS, BONUS_TASK, BONUS_TASK_ID } from '@/entities/task';
import { getDayCompletions, saveDayMarks, type TaskMark } from '@/entities/completion';

type MarksByChild = Record<string, Set<string>>;

export function useDayMarks(selectedDate: Ref<string>) {
  const $q = useQuasar();
  const saved = ref<MarksByChild>({});
  const checked = ref<MarksByChild>({});

  function marksOf(source: MarksByChild, childId: string): Set<string> {
    return source[childId] ?? new Set<string>();
  }

  function isChecked(childId: string, taskId: string): boolean {
    return marksOf(checked.value, childId).has(taskId);
  }

  function bonusEarned(childId: string): boolean {
    if (REGULAR_TASKS.length === 0) {
      return false;
    }
    const marks = marksOf(checked.value, childId);
    return REGULAR_TASKS.every((task) => marks.has(task.id));
  }

  const dirty = computed(() =>
    CHILDREN.some((child) => {
      const current = marksOf(checked.value, child.id);
      const stored = marksOf(saved.value, child.id);
      return current.size !== stored.size || [...current].some((id) => !stored.has(id));
    })
  );

  function toggle(childId: string, taskId: string, isOn: boolean): void {
    const marks = new Set(marksOf(checked.value, childId));
    if (isOn) {
      marks.add(taskId);
    } else {
      marks.delete(taskId);
    }
    checked.value = { ...checked.value, [childId]: marks };
  }

  async function load(): Promise<void> {
    const regularIds = new Set(REGULAR_TASKS.map((task) => task.id));
    const nextSaved: MarksByChild = {};
    const nextChecked: MarksByChild = {};
    for (const child of CHILDREN) {
      const rows = await getDayCompletions(child.id, selectedDate.value);
      const marks = new Set(rows.map((row) => row.taskId).filter((id) => regularIds.has(id)));
      nextSaved[child.id] = marks;
      nextChecked[child.id] = new Set(marks);
    }
    saved.value = nextSaved;
    checked.value = nextChecked;
  }

  async function accept(): Promise<void> {
    const celebrated: Child[] = [];
    for (const child of CHILDREN) {
      const stored = marksOf(saved.value, child.id);
      const wasCompleteBefore = REGULAR_TASKS.every((task) => stored.has(task.id));
      const earnsBonus = bonusEarned(child.id);
      if (earnsBonus && !wasCompleteBefore) {
        celebrated.push(child);
      }

      const marks: TaskMark[] = REGULAR_TASKS.filter((task) => isChecked(child.id, task.id)).map(
        (task) => ({ taskId: task.id, points: task.points })
      );
      if (earnsBonus && BONUS_TASK) {
        marks.push({ taskId: BONUS_TASK_ID, points: BONUS_TASK.points });
      }
      await saveDayMarks(child.id, selectedDate.value, marks);
    }

    await load();
    $q.notify({ type: 'positive', message: 'Сохранено' });
    for (const child of celebrated) {
      celebrate(child.carColor);
    }
  }

  watch(selectedDate, load);
  onMounted(load);

  return { isChecked, bonusEarned, toggle, dirty, accept };
}
