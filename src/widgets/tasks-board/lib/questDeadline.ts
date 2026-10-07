import { daysBetween } from '@/shared/lib/date';
import { DAY_WORD_FORMS } from '@/shared/lib/constants';
import { pluralize } from '@/shared/lib/plural';

export const questDeadlineLabel = (deadline: string | undefined, day: string): string => {
  if (deadline === undefined) {
    return '';
  }
  const left = daysBetween(day, deadline);
  return left <= 1 ? 'последний день' : `ещё ${left} ${pluralize(left, DAY_WORD_FORMS)}`;
};
