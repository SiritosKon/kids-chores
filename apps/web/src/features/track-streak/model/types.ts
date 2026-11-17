export interface StreakAward {
  id: string;
  childId: string;
  milestoneId: string;
  days: number;
  day: string;
  points?: number;
  rewardId?: string;
}
