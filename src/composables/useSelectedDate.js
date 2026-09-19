import { ref } from 'vue';
import { date } from 'quasar';
import { useParentSessionStore } from '@/entities/parent-session';

const selectedDate = ref(date.formatDate(Date.now(), 'YYYY-MM-DD'));

// Установленная PWA не перезагружает JS при возврате из фона, поэтому selectedDate
// иначе замерзает на дне, когда приложение загрузилось, и отметки уезжают на
// устаревшую дату. В обычном режиме при показе приложения возвращаем "сегодня";
// в родительском режиме сохраняем выбранную дату (правка истории).
function syncToTodayForChild() {
  if (!useParentSessionStore().active) {
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
