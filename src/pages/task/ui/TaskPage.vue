<template>
  <q-page class="q-pa-md settings-page">
    <PageHeader :title="title" :back-to="ROUTES.home" />
    <section v-if="tasksStore.loaded" class="ios-card q-pa-md">
      <TaskEditForm :key="taskId" :task="task" :as-quest="asQuest" @done="onDone" @cancel="close" />
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ROUTES, NEW_TASK_ID, QUEST_QUERY_KEY } from '@/shared/config/constants';
import { useGoBack } from '@/shared/lib/useGoBack';
import PageHeader from '@/shared/ui/PageHeader.vue';
import { useTasksStore } from '@/entities/task';
import { TaskEditForm } from '@/features/edit-task';
import { recalculateStreaks } from '@/features/track-streak';

const route = useRoute();
const router = useRouter();
const goBack = useGoBack();
const tasksStore = useTasksStore();

const taskId = computed(() => String(route.params.taskId ?? NEW_TASK_ID));

const asQuest = computed(() => route.query[QUEST_QUERY_KEY] === '1');

const task = computed(() =>
  taskId.value === NEW_TASK_ID ? null : (tasksStore.byId(taskId.value) ?? null)
);

watch(
  () => tasksStore.loaded,
  (loaded) => {
    if (loaded && taskId.value !== NEW_TASK_ID && (!task.value || task.value.archivedAt !== undefined)) {
      void router.replace(ROUTES.home);
    }
  },
  { immediate: true }
);

const title = computed(() => {
  if (!task.value) {
    return asQuest.value ? 'Новый квест' : 'Новая задача';
  }
  return task.value.quest ? 'Квест' : 'Задача';
});

const close = (): void => {
  goBack(ROUTES.home);
};

const onDone = async (): Promise<void> => {
  await recalculateStreaks();
  close();
};
</script>
