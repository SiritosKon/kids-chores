<template>
  <div>
    <q-btn flat round dense icon="more_vert" aria-label="Меню">
      <q-menu anchor="bottom right" self="top right">
        <q-list style="min-width: 220px">
          <template v-if="!active">
            <q-item clickable v-close-popup @click="showLogin = true">
              <q-item-section avatar><q-icon name="lock" /></q-item-section>
              <q-item-section>Родительский режим</q-item-section>
            </q-item>
          </template>
          <template v-else>
            <q-item-label header>Родительский режим</q-item-label>
            <q-item clickable v-close-popup @click="exportFull">
              <q-item-section avatar><q-icon name="download" /></q-item-section>
              <q-item-section>Экспорт (всё)</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="exportMonthly">
              <q-item-section avatar><q-icon name="calendar_month" /></q-item-section>
              <q-item-section>Экспорт за месяц</q-item-section>
            </q-item>
            <q-item clickable @click="pickFile">
              <q-item-section avatar><q-icon name="upload" /></q-item-section>
              <q-item-section>Импорт данных</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="showSpends = true">
              <q-item-section avatar><q-icon name="history" /></q-item-section>
              <q-item-section>История списаний</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup @click="logout">
              <q-item-section avatar><q-icon name="logout" /></q-item-section>
              <q-item-section>Выйти из режима</q-item-section>
            </q-item>
          </template>

          <q-separator />
          <q-item>
            <q-item-section class="text-caption text-grey-6">Версия {{ version }}</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>

    <input ref="fileInput" type="file" accept="application/json" style="display: none" @change="onFile" />
    <PasswordDialog v-model="showLogin" />
    <SpendsDialog v-model="showSpends" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import PasswordDialog from './PasswordDialog.vue';
import SpendsDialog from './SpendsDialog.vue';
import { useParentMode } from '../composables/useParentMode.js';
import { exportAll, exportMonth, importAll } from '../db/completionsRepo.js';

const $q = useQuasar();
const { active, logout } = useParentMode();
const showLogin = ref(false);
const showSpends = ref(false);
const fileInput = ref(null);
const version = __APP_VERSION__;

function download(payload, filename) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function exportFull() {
  const data = await exportAll();
  download(data, `kids-chores-full-${data.exportedAt.slice(0, 10)}.json`);
}

async function exportMonthly() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const data = await exportMonth(year, month);
  download(data, `kids-chores-${year}-${String(month).padStart(2, '0')}.json`);
}

function pickFile() {
  fileInput.value.click();
}

async function onFile(event) {
  const file = event.target.files[0];
  if (!file) {
    return;
  }
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    await importAll(data);
    $q.notify({ type: 'positive', message: 'Импорт выполнен' });
  } catch (error) {
    $q.notify({ type: 'negative', message: `Ошибка импорта: ${error.message}` });
  } finally {
    event.target.value = '';
  }
}
</script>
