import { ref } from 'vue';
import { todayKey } from './useWeek.js';

const selectedDate = ref(todayKey());

export function useSelectedDate() {
  return { selectedDate };
}
