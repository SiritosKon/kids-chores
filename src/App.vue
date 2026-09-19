<template>
  <div class="app-viewport">
    <div class="app-frame">
      <q-layout view="hHh lpR fFf" container style="height: 100%">
        <q-header class="bg-black text-white">
          <q-toolbar class="q-py-md items-start">
            <div class="col">
              <div class="text-h5 text-weight-bold">Домашние дела детей</div>
              <div class="ios-subtitle">
                <span class="text-capitalize">{{ dateLabel }}</span> · v{{ appVersion }}
              </div>
            </div>
            <div class="row items-center no-wrap q-gutter-sm">
              <q-badge v-if="parentActive" color="orange" text-color="black" label="Родительский контроль" />
              <ParentMenu />
            </div>
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
    <WhatsNewDialog v-model="whatsNewOpen" />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { ParentMenu } from '@/widgets/parent-menu';
import HomePage from './pages/HomePage.vue';
import { isPersistenceAvailable } from '@/shared/api/db';
import { recordVersion } from '@/entities/app-version';
import { useSelectedDateStore } from '@/features/select-date';
import { storeToRefs } from 'pinia';
import { useParentSessionStore } from '@/entities/parent-session';
import { useWhatsNewStore } from '@/features/whats-new';
import { WhatsNewDialog } from '@/features/whats-new';

const $q = useQuasar();
const persistence = isPersistenceAvailable();
const { selectedDate } = storeToRefs(useSelectedDateStore());
const { active: parentActive } = storeToRefs(useParentSessionStore());
const whatsNew = useWhatsNewStore();
const { isOpen: whatsNewOpen } = storeToRefs(whatsNew);
const openWhatsNew = whatsNew.open;
const appVersion = __APP_VERSION__;

onMounted(async () => {
  try {
    const { isNew, hadHistory } = await recordVersion(appVersion);
    if (isNew && hadHistory) {
      window.__kidsWhatsNew = openWhatsNew;
      $q.notify({
        html: true,
        message: `<span onclick="window.__kidsWhatsNew()" style="cursor:pointer;display:block">Обновлено до v${appVersion}</span>`,
        icon: 'system_update',
        color: 'dark',
        textColor: 'white',
        timeout: 5000,
      });
    }
  } catch {
    // БД может быть недоступна
  }
});

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
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.app-frame {
  flex: 0 0 auto;
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

/* Единый стиль всех модалок */
.q-dialog .q-card {
  border-radius: 18px;
}
</style>
