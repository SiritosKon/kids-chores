import type { StreakMilestone } from '../model/types';

export type MilestoneRule = Pick<StreakMilestone, 'days' | 'points' | 'rewardId'>;
