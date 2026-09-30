import { createRouter, createWebHashHistory } from 'vue-router';
import { ROUTES } from '@/shared/config/constants';
import { useParentSessionStore } from '@/entities/parent-session';
import { HomePage } from '@/pages/home';
import { SettingsPage } from '@/pages/settings';

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
