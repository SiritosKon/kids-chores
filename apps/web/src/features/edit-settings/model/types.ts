export type PinStep = 'current' | 'next' | 'repeat';

export interface StageDraft {
  days: number;
  points: number;
  rewardId: string | null;
  forEveryone: boolean;
  childIds: string[];
}
