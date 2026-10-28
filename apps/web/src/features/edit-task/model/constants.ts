import type { QuestTerm, QuestTermOption } from './types';

export const QUEST_TERM_OPTIONS: readonly QuestTermOption[] = [
  { value: 'today', labelKey: 'editTask.terms.today', days: 1 },
  { value: 'tomorrow', labelKey: 'editTask.terms.tomorrow', days: 2 },
  { value: 'three-days', labelKey: 'editTask.terms.threeDays', days: 3 },
  { value: 'week', labelKey: 'editTask.terms.week', days: 7 },
  { value: 'custom', labelKey: 'editTask.terms.custom' },
];

export const DEFAULT_QUEST_TERM: QuestTerm = 'tomorrow';
