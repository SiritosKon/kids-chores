import { ROUTES } from '@/shared/config/constants';

export const stagePath = (stageId: string): string => ROUTES.settingsStage.replace(':stageId', stageId);

export const stageRewardPath = (stageId: string): string =>
  ROUTES.settingsStageReward.replace(':stageId', stageId);

export const rewardPath = (rewardId: string): string => ROUTES.reward.replace(':rewardId', rewardId);

export const taskPath = (taskId: string): string => ROUTES.task.replace(':taskId', taskId);

export const childPath = (childId: string): string => ROUTES.child.replace(':childId', childId);

export const routeDepth = (path: string): number => path.split('/').filter(Boolean).length;
