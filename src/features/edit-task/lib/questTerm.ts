import { dayKeySchema, shiftDayKey } from '@/shared/lib/date';
import type { QuestDates } from '@/entities/task';
import { QUEST_TERM_OPTIONS } from '../model/constants';
import type { QuestTerm } from '../model/types';

export const termDates = (term: QuestTerm, today: string, custom: QuestDates): QuestDates => {
  const days = QUEST_TERM_OPTIONS.find((option) => option.value === term)?.days;
  return days === undefined ? custom : { from: today, lastDay: shiftDayKey(today, days - 1) };
};

export const questDatesError = (dates: QuestDates, today: string): string | null => {
  if (!dayKeySchema.safeParse(dates.from).success || !dayKeySchema.safeParse(dates.lastDay).success) {
    return 'Укажите даты начала и конца';
  }
  if (dates.lastDay < dates.from) {
    return 'Конец раньше начала';
  }
  if (dates.lastDay < today) {
    return 'Квест уже закончился бы — выберите конец не раньше сегодня';
  }
  return null;
};
