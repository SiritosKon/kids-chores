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
          <q-item clickable v-close-popup @click="openWhatsNew">
            <q-item-section avatar><q-icon name="auto_awesome" /></q-item-section>
            <q-item-section>Что нового</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>

    <input ref="fileInput" type="file" accept="application/json" style="display: none" @change="onFile" />
    <PasswordDialog v-model="showLogin" />
    <SpendsDialog v-model="showSpends" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { useParentSessionStore } from '@/entities/parent-session';
import { PasswordDialog } from '@/features/parent-login';
import { SpendsDialog } from '@/features/rollback-spend';
import { useWhatsNewStore } from '@/features/whats-new';
import { exportAll, exportMonth, importAll, downloadJson } from '@/features/backup';

const $q = useQuasar();
const parentSession = useParentSessionStore();
const { active } = storeToRefs(parentSession);
const logout = parentSession.logout;
const openWhatsNew = useWhatsNewStore().open;

const showLogin = ref(false);
const showSpends = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const exportFull = async (): Promise<void> => {
  const data = await exportAll();
  downloadJson(data, `kids-chores-full-${data.exportedAt?.slice(0, 10) ?? 'export'}.json`);
};

const exportMonthly = async (): Promise<void> => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const data = await exportMonth(year, month);
  downloadJson(data, `kids-chores-${year}-${String(month).padStart(2, '0')}.json`);
};

const pickFile = (): void => {
  fileInput.value?.click();
};

const onFile = async (event: Event): Promise<void> => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) {
    return;
  }
  try {
    await importAll(JSON.parse(await file.text()));
    $q.notify({ type: 'positive', message: 'Импорт выполнен' });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    $q.notify({ type: 'negative', message: `Ошибка импорта: ${reason}` });
  } finally {
    input.value = '';
  }
};
</script>
