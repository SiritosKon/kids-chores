import { dayKeySchema, shiftDayKey } from '@/shared/lib/date';
import { i18n } from '@/shared/i18n';
import type { QuestDates } from '@/entities/task';
import { QUEST_TERM_OPTIONS } from '../model/constants';
import type { QuestTerm } from '../model/types';

export const termDates = (term: QuestTerm, today: string, custom: QuestDates): QuestDates => {
  const days = QUEST_TERM_OPTIONS.find((option) => option.value === term)?.days;
  return days === undefined ? custom : { from: today, lastDay: shiftDayKey(today, days - 1) };
};

export const questDatesError = (dates: QuestDates, today: string): string | null => {
  if (!dayKeySchema.safeParse(dates.from).success || !dayKeySchema.safeParse(dates.lastDay).success) {
    return i18n.global.t('editTask.errors.missingDates');
  }
  if (dates.lastDay < dates.from) {
    return i18n.global.t('editTask.errors.endBeforeStart');
  }
  if (dates.lastDay < today) {
    return i18n.global.t('editTask.errors.alreadyOver');
  }
  return null;
};
