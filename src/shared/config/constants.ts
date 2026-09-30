export const ROUTES = {
  home: '/',
  settings: '/settings',
  settingsPin: '/settings/pin',
  settingsStage: '/settings/stage/:stageId',
  settingsStageReward: '/settings/stage/:stageId/reward',
} as const;

export const NEW_STAGE_ID = 'new';
