import { DEFAULT_METER_FIGURE } from '@/shared/ui/constants';
import type { ChildFormDraft } from './types';

export const EMPTY_CHILD_DRAFT: ChildFormDraft = {
  name: '',
  carColor: '',
  figure: DEFAULT_METER_FIGURE,
  photo: '',
  goalRewardId: null,
  goalVariantId: null,
};
