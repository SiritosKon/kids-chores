import { ref, onScopeDispose } from 'vue';
import { defineStore } from 'pinia';
import { todayKey } from '@/shared/lib/date';
import { useParentSessionStore } from '@/entities/parent-session';

export const useSelectedDateStore = defineStore('selected-date', () => {
  const selectedDate = ref(todayKey());
  const parentSession = useParentSessionStore();

  const syncToTodayForChild = (): void => {
    if (!parentSession.active) {
      selectedDate.value = todayKey();
    }
  };

  const onVisibilityChange = (): void => {
    if (document.visibilityState === 'visible') {
      syncToTodayForChild();
    }
  };

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', onVisibilityChange);
    onScopeDispose(() => document.removeEventListener('visibilitychange', onVisibilityChange));
  }

  return { selectedDate };
});
