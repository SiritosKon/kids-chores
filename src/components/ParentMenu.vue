<template>
  <div>
    <q-btn flat round dense icon="more_horiz" aria-label="Меню" @click="openMenu" />
    <input ref="fileInput" type="file" accept="application/json" style="display: none" @change="onFile" />
    <PasswordDialog v-model="showLogin" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import PasswordDialog from './PasswordDialog.vue';
import { useParentMode } from '../composables/useParentMode.js';
import { exportAll, exportMonth, importAll } from '../db/completionsRepo.js';

const $q = useQuasar();
const { active, logout } = useParentMode();
const showLogin = ref(false);
const fileInput = ref(null);

function openMenu() {
  if (!active.value) {
    showLogin.value = true;
    return;
  }
  $q.bottomSheet({
    message: 'Родительский режим',
    actions: [
      { label: 'Экспорт (всё)', icon: 'download', id: 'exportAll' },
      { label: 'Экспорт за месяц', icon: 'calendar_month', id: 'exportMonth' },
      { label: 'Импорт данных', icon: 'upload', id: 'import' },
      {},
      { label: 'Выйти из режима', icon: 'logout', id: 'logout' },
    ],
  }).onOk((action) => runAction(action.id));
}

function download(payload, filename) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function runAction(id) {
  if (id === 'exportAll') {
    const data = await exportAll();
    download(data, `kids-chores-full-${data.exportedAt.slice(0, 10)}.json`);
  } else if (id === 'exportMonth') {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const data = await exportMonth(year, month);
    download(data, `kids-chores-${year}-${String(month).padStart(2, '0')}.json`);
  } else if (id === 'import') {
    fileInput.value.click();
  } else if (id === 'logout') {
    logout();
    $q.notify({ type: 'info', message: 'Родительский режим выключен' });
  }
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
