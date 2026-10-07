import type { MeterFigureKind } from '@/shared/ui/types';

export interface ChildFormDraft {
  name: string;
  carColor: string;
  figure: MeterFigureKind;
  photo: string;
  goalRewardId: string | null;
  goalVariantId: string | null;
}
