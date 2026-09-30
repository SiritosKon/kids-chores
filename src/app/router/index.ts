import { createRouter, createWebHashHistory } from 'vue-router';
import { ROUTES } from '@/shared/config/constants';
import { useParentSessionStore } from '@/entities/parent-session';
import { HomePage } from '@/pages/home';
import { SettingsPage } from '@/pages/settings';
import { BACK_TRANSITION, FORWARD_TRANSITION } from './constants';

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: ROUTES.home, component: HomePage },
    { path: ROUTES.settings, component: SettingsPage, meta: { parentOnly: true } },
    { path: '/:rest(.*)*', redirect: ROUTES.home },
  ],
});

router.beforeEach((to) =>
  to.meta.parentOnly === true && !useParentSessionStore().active ? ROUTES.home : true
);

router.afterEach((to) => {
  to.meta.transition = to.path === ROUTES.home ? BACK_TRANSITION : FORWARD_TRANSITION;
});
