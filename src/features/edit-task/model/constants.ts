import type { QuestTerm, QuestTermOption } from './types';

export const QUEST_TERM_OPTIONS: readonly QuestTermOption[] = [
  { value: 'today', label: 'Только сегодня', days: 1 },
  { value: 'tomorrow', label: 'До завтра', days: 2 },
  { value: 'three-days', label: '3 дня', days: 3 },
  { value: 'week', label: 'Неделя', days: 7 },
  { value: 'custom', label: 'Свои даты' },
];

export const DEFAULT_QUEST_TERM: QuestTerm = 'tomorrow';
