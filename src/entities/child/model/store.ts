import { ref, computed, onScopeDispose } from 'vue';
import { defineStore } from 'pinia';
import { childrenCatalogue } from '../api/childrenRepo';
import type { Child } from './schema';

export const useChildrenStore = defineStore('children', () => {
  const items = ref<Child[]>([]);
  const loaded = ref(false);

  const subscription = childrenCatalogue.watch((rows) => {
    items.value = rows;
    loaded.value = true;
  });
  onScopeDispose(() => subscription.unsubscribe());

  const active = computed(() => items.value.filter((child) => child.active));

  const byId = (childId: string): Child | undefined =>
    items.value.find((child) => child.id === childId);

  const nameOf = (childId: string): string => byId(childId)?.name ?? childId;

  return { items, active, loaded, byId, nameOf };
});
