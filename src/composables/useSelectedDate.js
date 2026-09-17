import { ref } from 'vue';
import { date } from 'quasar';
import { useParentMode } from './useParentMode.js';

const selectedDate = ref(date.formatDate(Date.now(), 'YYYY-MM-DD'));
const { active: parentActive } = useParentMode();

// Установленная PWA не перезагружает JS при возврате из фона, поэтому selectedDate
// иначе замерзает на дне, когда приложение загрузилось, и отметки уезжают на
// устаревшую дату. В обычном режиме при показе приложения возвращаем "сегодня";
// в родительском режиме сохраняем выбранную дату (правка истории).
function syncToTodayForChild() {
  if (!parentActive.value) {
    selectedDate.value = date.formatDate(Date.now(), 'YYYY-MM-DD');
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
