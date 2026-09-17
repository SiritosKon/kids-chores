import { ref } from 'vue';
import { todayKey } from './useWeek.js';
import { useParentMode } from './useParentMode.js';

const selectedDate = ref(todayKey());
const { active: parentActive } = useParentMode();

// Установленная PWA не перезагружает JS при возврате из фона, поэтому selectedDate
// иначе замерзает на дне, когда приложение загрузилось, и отметки уезжают на
// устаревшую дату. В обычном режиме при показе приложения возвращаем "сегодня";
// в родительском режиме сохраняем выбранную дату (правка истории).
function syncToTodayForChild() {
  if (!parentActive.value) {
    selectedDate.value = todayKey();
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      syncToTodayForChild();
    }
  });
}

export function useSelectedDate() {
  return { selectedDate };
}
