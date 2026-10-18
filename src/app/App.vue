<template>
  <div class="app-viewport">
    <div class="app-frame">
      <q-layout view="hHh lpR fFf" container style="height: 100%">
        <q-header class="bg-black text-white">
          <q-toolbar class="q-py-md items-start">
            <q-btn
              v-if="!needsSetup"
              flat
              round
              dense
              icon="menu"
              aria-label="Меню"
              data-tour="parent-menu"
              class="q-mr-sm q-mt-xs"
              @click="menuOpen = true"
            />
            <div class="col">
              <div class="text-h5 text-weight-bold">Домашние дела детей</div>
              <div class="ios-subtitle">
                <span class="text-capitalize">{{ dateLabel }}</span> · v{{ appVersion }}
              </div>
            </div>
            <div class="row items-center no-wrap q-gutter-sm">
              <q-badge
                v-if="parentActive"
                color="orange"
                text-color="black"
                label="Родительский контроль"
                data-tour="parent-badge"
              />
            </div>
          </q-toolbar>
        </q-header>

        <SideMenu v-if="!needsSetup" v-model="menuOpen" />

        <q-page-container>
          <q-banner v-if="!persistence" class="bg-warning text-black">
            Хранилище недоступно — отметки не сохранятся между сессиями.
          </q-banner>
          <OnboardingPage v-if="needsSetup" />
          <div v-else-if="settingsStore.loaded" class="page-stack">
            <router-view v-slot="{ Component, route }">
              <transition :name="route.meta.transition" mode="out-in">
                <keep-alive include="HomePage">
                  <component :is="Component" />
                </keep-alive>
              </transition>
            </router-view>
          </div>
        </q-page-container>
      </q-layout>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { ROUTES } from '@/shared/config/constants';
import { formatDayKeyLong } from '@/shared/lib/date';
import { isPersistenceAvailable } from '@/shared/api/db';
import { recordVersion } from '@/entities/app-version';
import { useParentSessionStore } from '@/entities/parent-session';
import { useSettingsStore } from '@/entities/settings';
import { useSelectedDateStore } from '@/features/select-date';
import { useParentAutoLogout } from '@/features/parent-auto-logout';
import { SideMenu } from '@/widgets/side-menu';
import { OnboardingPage } from '@/pages/onboarding';

const $q = useQuasar();
const persistence = isPersistenceAvailable();
const { selectedDate } = storeToRefs(useSelectedDateStore());
const { active: parentActive } = storeToRefs(useParentSessionStore());
const appVersion = __APP_VERSION__;
const settingsStore = useSettingsStore();
const menuOpen = ref(false);

useParentAutoLogout();

const route = useRoute();
const router = useRouter();

watch(parentActive, (active) => {
  if (!active && route.meta.parentOnly === true) {
    void router.replace(ROUTES.home);
  }
});

const needsSetup = computed(() => settingsStore.loaded && !settingsStore.settings?.parentPin);

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
      window.__kidsWhatsNew = () => {
        void router.push(ROUTES.whatsNew);
      };
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
