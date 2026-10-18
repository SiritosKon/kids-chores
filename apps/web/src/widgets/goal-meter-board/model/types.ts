import type { MeterFigureKind } from '@/shared/ui/types';

export interface GoalEntry {
  name: string;
  price: number;
  saved: number;
  ratio: number;
  ready: boolean;
  icon: string;
  color: string;
  photo: string;
}

export interface MeterEntry {
  childId: string;
  name: string;
  photo: string;
  carColor: string;
  figure: MeterFigureKind;
  balance: number;
  ratio: number;
  streak: number;
  pendingChoices: number;
  goal: GoalEntry | null;
}
