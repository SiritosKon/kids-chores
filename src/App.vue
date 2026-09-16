<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-dark text-white">
      <q-toolbar>
        <q-toolbar-title>Домашние дела</q-toolbar-title>
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
import ParentMenu from './components/ParentMenu.vue';
import HomePage from './pages/HomePage.vue';
import { isPersistenceAvailable } from './db/db.js';

const persistence = isPersistenceAvailable();
</script>

<style>
body.body--dark {
  background: #3d3d3d;
}

.q-page {
  background: #3d3d3d;
}
</style>
