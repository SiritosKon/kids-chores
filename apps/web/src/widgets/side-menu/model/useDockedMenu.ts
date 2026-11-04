import { computed, type ComputedRef } from 'vue';
import { useQuasar } from 'quasar';
import { DOCKED_MENU_MIN_WIDTH } from './constants';

export const useDockedMenu = (): ComputedRef<boolean> => {
  const $q = useQuasar();
  return computed(() => $q.screen.width >= DOCKED_MENU_MIN_WIDTH);
};
