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

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { formatDayKeyLong } from '@/shared/lib/date';
import { isPersistenceAvailable } from '@/shared/api/db';
import { recordVersion } from '@/entities/app-version';
import { useParentSessionStore } from '@/entities/parent-session';
import { useSelectedDateStore } from '@/features/select-date';
import { useWhatsNewStore, WhatsNewDialog } from '@/features/whats-new';
import { ParentMenu } from '@/widgets/parent-menu';
import { HomePage } from '@/pages/home';

const $q = useQuasar();
const persistence = isPersistenceAvailable();
const { selectedDate } = storeToRefs(useSelectedDateStore());
const { active: parentActive } = storeToRefs(useParentSessionStore());
const whatsNew = useWhatsNewStore();
const { isOpen: whatsNewOpen } = storeToRefs(whatsNew);
const appVersion = __APP_VERSION__;

const dateLabel = computed(() => formatDayKeyLong(selectedDate.value));

declare global {
  interface Window {
    __kidsWhatsNew?: () => void;
  }
}

onMounted(async () => {
  try {
    const { isNew, hadHistory } = await recordVersion(appVersion);
    if (isNew && hadHistory) {
      window.__kidsWhatsNew = whatsNew.open;
      $q.notify({
        html: true,
        message: `<span onclick="window.__kidsWhatsNew()" style="cursor:pointer;display:block">Обновлено до v${appVersion}</span>`,
        icon: 'system_update',
        color: 'dark',
        textColor: 'white',
        timeout: 5000,
      });
    }
  } catch {}
});
</script>
