<template>
  <div class="app-viewport">
    <div class="app-frame">
      <q-layout view="hHh lpR fFf" container style="height: 100%">
        <q-header class="bg-black text-white">
          <q-toolbar class="q-py-md items-start">
            <div class="col">
              <div class="text-h5 text-weight-bold">Домашние дела</div>
              <div class="ios-subtitle text-capitalize">{{ dateLabel }}</div>
            </div>
            <ParentMenu />
          </q-toolbar>
        </q-header>

        <q-page-container>
          <q-banner v-if="!persistence" class="bg-warning text-black">
            Хранилище недоступно — отметки не сохранятся между сессиями.
          </q-banner>
          <HomePage />
        </q-page-container>
      </q-layout>
    </div>
  </div>
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
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
});
</script>

<style>
html,
body,
#app {
  height: 100%;
}

body.body--dark {
  background: #262626;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;
}

.app-viewport {
  min-height: 100vh;
  display: flex;
  justify-content: center;
}

.app-frame {
  width: min(834px, 100%);
  height: 100vh;
  background: #000000;
  box-shadow: 0 0 48px rgba(0, 0, 0, 0.6);
}

.q-page {
  background: #000000;
}

.ios-card {
  background: #1c1c1e;
  border-radius: 16px;
  overflow: hidden;
}

.ios-subtitle {
  font-size: 14px;
  color: #8e8e93;
}
</style>
