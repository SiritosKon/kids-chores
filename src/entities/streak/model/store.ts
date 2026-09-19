import { ref, onScopeDispose } from 'vue';
import { defineStore } from 'pinia';
import { watchStreaks } from '../api/streaksRepo';
import type { StreakState } from './schema';

export const useStreakStore = defineStore('streak', () => {
  const items = ref<StreakState[]>([]);
  const loaded = ref(false);

  const subscription = watchStreaks((states) => {
    items.value = states;
    loaded.value = true;
  });
  onScopeDispose(() => subscription.unsubscribe());

  const currentOf = (childId: string): number =>
    items.value.find((state) => state.childId === childId)?.current ?? 0;

  return { items, loaded, currentOf };
});
