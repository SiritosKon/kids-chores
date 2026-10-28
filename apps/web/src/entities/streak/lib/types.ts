export interface StreakMilestoneInput {
  id: string;
  days: number;
  points?: number;
  rewardId?: string;
  from?: string;
  to?: string;
}

export interface StreakHit {
  milestoneId: string;
  days: number;
  day: string;
  points?: number;
  rewardId?: string;
}

export interface StreakSummary {
  current: number;
  best: number;
  lastClosedDate: string | null;
  hits: StreakHit[];
}

export interface DayMark {
  date: string;
  taskId: string;
}

export interface StreakProgress {
  milestoneId: string;
  days: number;
  points?: number;
  rewardId?: string;
  achieved: number;
  remaining: number;
  ratio: number;
}
