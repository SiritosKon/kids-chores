<template>
  <div>
    <q-btn flat round dense icon="more_vert" aria-label="Меню">
      <q-menu>
        <q-list style="min-width: 220px">
          <template v-if="!active">
            <q-item clickable v-close-popup @click="showLogin = true">
              <q-item-section avatar><q-icon name="lock" /></q-item-section>
              <q-item-section>Родительский режим</q-item-section>
            </q-item>
          </template>
          <template v-else>
            <q-item-label header>Родительский режим</q-item-label>
            <ImportExport />
            <q-separator />
            <q-item clickable v-close-popup @click="logout">
              <q-item-section avatar><q-icon name="logout" /></q-item-section>
              <q-item-section>Выйти</q-item-section>
            </q-item>
          </template>
        </q-list>
      </q-menu>
    </q-btn>

    <PasswordDialog v-model="showLogin" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import PasswordDialog from './PasswordDialog.vue';
import ImportExport from './ImportExport.vue';
import { useParentMode } from '../composables/useParentMode.js';

const { active, logout } = useParentMode();
const showLogin = ref(false);
</script>
