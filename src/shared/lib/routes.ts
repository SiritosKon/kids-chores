import { ROUTES } from '@/shared/config/constants';

export const stagePath = (stageId: string): string => ROUTES.settingsStage.replace(':stageId', stageId);

export const stageRewardPath = (stageId: string): string =>
  ROUTES.settingsStageReward.replace(':stageId', stageId);

export const routeDepth = (path: string): number => path.split('/').filter(Boolean).length;
