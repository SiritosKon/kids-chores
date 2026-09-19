import { table, transaction } from '@/shared/api/db';
import { weekDayKeys } from '@/shared/lib/week';
import { storedCompletionSchema, type Completion } from '../model/schema';

export const completionsTable = table<Completion>('completions');

export interface TaskMark {
  taskId: string;
  points: number;
}

export const getDayCompletions = async (childId: string, dateKey: string): Promise<Completion[]> => {
  const rows = await completionsTable.where('[childId+date]').equals([childId, dateKey]).toArray();
  return storedCompletionSchema.array().parse(rows);
};

export const saveDayMarks = async (childId: string, dateKey: string, marks: TaskMark[]): Promise<void> => {
  const existing = await getDayCompletions(childId, dateKey);
  const existingTaskIds = new Set(existing.map((row) => row.taskId));
  const markedTaskIds = new Set(marks.map((mark) => mark.taskId));

  const now = Date.now();
  const toAdd: Completion[] = marks
    .filter((mark) => !existingTaskIds.has(mark.taskId))
    .map((mark) => ({
      id: crypto.randomUUID(),
      childId,
      taskId: mark.taskId,
      date: dateKey,
      points: mark.points,
      createdAt: now,
      updatedAt: now,
    }));

  const toDelete = existing.filter((row) => !markedTaskIds.has(row.taskId)).map((row) => row.id);

  await transaction([completionsTable], async () => {
    if (toDelete.length > 0) {
      await completionsTable.bulkDelete(toDelete);
    }
    if (toAdd.length > 0) {
      await completionsTable.bulkAdd(toAdd);
    }
  });
};

export const resetWeek = async (childId: string, referenceDate: Date | number = Date.now()): Promise<void> => {
  const pairs = weekDayKeys(referenceDate).map((key) => [childId, key]);
  await completionsTable.where('[childId+date]').anyOf(pairs).delete();
};

export const getChildCompletions = async (childId: string): Promise<Completion[]> =>
  storedCompletionSchema
    .array()
    .parse(await completionsTable.where('childId').equals(childId).toArray());

export const getAllCompletions = async (): Promise<Completion[]> => {
  return storedCompletionSchema.array().parse(await completionsTable.toArray());
};
