import { onBeforeUnmount, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useParentSessionStore } from '@/entities/parent-session';
import { useSettingsStore } from '@/entities/settings';
import { ACTIVITY_EVENTS, PARENT_IDLE_LIMIT_MS } from './constants';

export const useParentAutoLogout = () => {
  const $q = useQuasar();
  const parentSession = useParentSessionStore();
  const settingsStore = useSettingsStore();

  let lastActivity = Date.now();
  let timer: number | undefined;

  const touch = (): void => {
    lastActivity = Date.now();
  };

  const stopTimer = (): void => {
    window.clearTimeout(timer);
    timer = undefined;
  };

  const check = (): void => {
    stopTimer();
    if (!parentSession.active) {
      return;
    }
    if (settingsStore.settings?.tourPending === true) {
      touch();
    }
    const idle = Date.now() - lastActivity;
    if (idle < PARENT_IDLE_LIMIT_MS) {
      timer = window.setTimeout(check, PARENT_IDLE_LIMIT_MS - idle);
      return;
    }
    parentSession.logout();
    $q.notify({ icon: 'lock', color: 'dark', message: 'Родительский режим закрыт: долго не было действий' });
  };

  const onVisibility = (): void => {
    if (document.visibilityState === 'visible') {
      check();
    }
  };

  watch(
    () => parentSession.active,
    (active) => {
      touch();
      if (active) {
        check();
      } else {
        stopTimer();
      }
    },
    { immediate: true }
  );

  onMounted(() => {
    ACTIVITY_EVENTS.forEach((name) => window.addEventListener(name, touch, { capture: true, passive: true }));
    document.addEventListener('visibilitychange', onVisibility);
  });

  onBeforeUnmount(() => {
    ACTIVITY_EVENTS.forEach((name) => window.removeEventListener(name, touch, { capture: true }));
    document.removeEventListener('visibilitychange', onVisibility);
    stopTimer();
  });
};
