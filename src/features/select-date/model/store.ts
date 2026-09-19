import { ref, onScopeDispose } from 'vue';
import { defineStore } from 'pinia';
import { todayKey } from '@/shared/lib/date';
import { useParentSessionStore } from '@/entities/parent-session';

export const useSelectedDateStore = defineStore('selected-date', () => {
  const selectedDate = ref(todayKey());
  const parentSession = useParentSessionStore();

  // Установленная PWA не перезагружает JS при возврате из фона, поэтому
  // selectedDate иначе замерзает на дне, когда приложение загрузилось, и отметки
  // уезжают на устаревшую дату. В обычном режиме при показе приложения
  // возвращаем «сегодня»; в родительском сохраняем выбранную дату (правка истории).
  function syncToTodayForChild(): void {
    if (!parentSession.active) {
      selectedDate.value = todayKey();
    }
  }

  function onVisibilityChange(): void {
    if (document.visibilityState === 'visible') {
      syncToTodayForChild();
    }
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', onVisibilityChange);
    onScopeDispose(() => document.removeEventListener('visibilitychange', onVisibilityChange));
  }

  return { selectedDate };
});
