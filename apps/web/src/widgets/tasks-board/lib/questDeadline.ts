import { daysBetween } from '@/shared/lib/date';
import { i18n } from '@/shared/i18n';

export const questDeadlineLabel = (deadline: string | undefined, day: string): string => {
  if (deadline === undefined) {
    return '';
  }
  const left = daysBetween(day, deadline);
  return left <= 1 ? i18n.global.t('tasksBoard.lastDay') : i18n.global.t('tasksBoard.daysLeft', left);
};
