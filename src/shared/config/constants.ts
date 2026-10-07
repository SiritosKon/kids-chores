export const ROUTES = {
  home: '/',
  settings: '/settings',
  settingsPin: '/settings/pin',
  settingsStage: '/settings/stage/:stageId',
  settingsStageReward: '/settings/stage/:stageId/reward',
  reward: '/rewards/:rewardId',
  task: '/tasks/:taskId',
  child: '/children/:childId',
} as const;

export const NEW_STAGE_ID = 'new';

export const NEW_REWARD_ID = 'new';

export const NEW_TASK_ID = 'new';

export const QUEST_QUERY_KEY = 'quest';

export const NEW_CHILD_ID = 'new';
