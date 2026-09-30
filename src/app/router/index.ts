import { createRouter, createWebHashHistory } from 'vue-router';
import { ROUTES } from '@/shared/config/constants';
import { routeDepth } from '@/shared/lib/routes';
import { useParentSessionStore } from '@/entities/parent-session';
import { HomePage } from '@/pages/home';
import { SettingsPage, StreakStagePage, StageRewardPage, PinPage } from '@/pages/settings';
import { BACK_TRANSITION, FORWARD_TRANSITION } from './constants';

const parentOnly = { parentOnly: true };

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: ROUTES.home, component: HomePage },
    { path: ROUTES.settings, component: SettingsPage, meta: parentOnly },
    { path: ROUTES.settingsPin, component: PinPage, meta: parentOnly },
    { path: ROUTES.settingsStage, component: StreakStagePage, meta: parentOnly },
    { path: ROUTES.settingsStageReward, component: StageRewardPage, meta: parentOnly },
    { path: '/:rest(.*)*', redirect: ROUTES.home },
  ],
});

router.beforeEach((to) =>
  to.meta.parentOnly === true && !useParentSessionStore().active ? ROUTES.home : true
);

router.afterEach((to, from) => {
  to.meta.transition = routeDepth(to.path) < routeDepth(from.path) ? BACK_TRANSITION : FORWARD_TRANSITION;
});
