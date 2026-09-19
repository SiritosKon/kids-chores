export { completionSchema, storedCompletionSchema, type Completion } from './model/schema';
export {
  completionsTable,
  getDayCompletions,
  saveDayMarks,
  resetWeek,
  getAllCompletions,
  type TaskMark,
} from './api/completionsRepo';
