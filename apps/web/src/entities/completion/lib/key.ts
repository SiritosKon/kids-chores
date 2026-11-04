import { completionId, isStreakAwardId } from '@/shared/api/ids';
import type { Completion } from '../model/types';

export const withCompletionKey = (row: Completion): Completion =>
  isStreakAwardId(row.id) ? row : { ...row, id: completionId(row.childId, row.taskId, row.date) };
