import { ROUTES, NEW_TASK_ID, QUEST_QUERY_KEY, GOAL_QUERY_KEY } from '@/shared/config/constants';

export const stagePath = (stageId: string): string => ROUTES.settingsStage.replace(':stageId', stageId);

export const stageRewardPath = (stageId: string): string =>
  ROUTES.settingsStageReward.replace(':stageId', stageId);

export const rewardPath = (rewardId: string): string => ROUTES.reward.replace(':rewardId', rewardId);

export const taskPath = (taskId: string): string => ROUTES.task.replace(':taskId', taskId);

export const newQuestPath = (): string => `${taskPath(NEW_TASK_ID)}?${QUEST_QUERY_KEY}=1`;

export const childPath = (childId: string): string => ROUTES.child.replace(':childId', childId);

export const childGoalPath = (childId: string): string => `${childPath(childId)}?${GOAL_QUERY_KEY}=1`;

export const childRewardPath = (childId: string): string =>
  ROUTES.childReward.replace(':childId', childId);

export const routeDepth = (path: string): number => path.split('/').filter(Boolean).length;
