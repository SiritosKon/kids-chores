import { ref, computed, onScopeDispose } from 'vue';
import { defineStore } from 'pinia';
import { tasksCatalogue } from '../api/tasksRepo';
import { reservedTaskName } from '../lib/reserved';
import type { Task } from './schema';

export const useTasksStore = defineStore('tasks', () => {
  const items = ref<Task[]>([]);
  const loaded = ref(false);

  const subscription = tasksCatalogue.watch((rows) => {
    items.value = rows;
    loaded.value = true;
  });
  onScopeDispose(() => subscription.unsubscribe());

  const active = computed(() => items.value.filter((task) => task.active));

  const byId = (taskId: string): Task | undefined => items.value.find((task) => task.id === taskId);

  const nameOf = (taskId: string): string => reservedTaskName(taskId) ?? byId(taskId)?.name ?? taskId;

  return { items, active, loaded, byId, nameOf };
});
