<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-dark text-white">
      <q-toolbar>
        <q-toolbar-title>Домашние дела</q-toolbar-title>
        <div class="text-body2 q-mr-sm text-capitalize">{{ dateLabel }}</div>
        <ParentMenu />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-banner v-if="!persistence" class="bg-warning text-white">
        Хранилище недоступно — отметки не сохранятся между сессиями.
      </q-banner>
      <HomePage />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { computed } from 'vue';
import ParentMenu from './components/ParentMenu.vue';
import HomePage from './pages/HomePage.vue';
import { isPersistenceAvailable } from './db/db.js';
import { useSelectedDate } from './composables/useSelectedDate.js';

const persistence = isPersistenceAvailable();
const { selectedDate } = useSelectedDate();

const dateLabel = computed(() => {
  const [year, month, day] = selectedDate.value.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  });
});
</script>

<style>
body.body--dark {
  background: #3d3d3d;
}

.q-page {
  background: #3d3d3d;
}
</style>
