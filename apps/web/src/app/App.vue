<template>
  <div class="app-viewport">
    <div class="app-frame">
      <q-layout view="hHh lpR fFf" container style="height: 100%">
        <q-header class="bg-black text-white">
          <q-toolbar class="q-py-md items-start app-column">
            <q-btn
              v-if="!needsSetup"
              flat
              round
              dense
              icon="menu"
              :aria-label="t('common.menu')"
              data-tour="parent-menu"
              class="q-mr-sm q-mt-xs"
              @click="menuOpen = true"
            />
            <div class="col">
              <div class="text-h5 text-weight-bold">{{ APP_NAME }}</div>
              <div class="ios-subtitle">
                {{ dateLabel }}
              </div>
            </div>
            <div class="row items-center no-wrap q-gutter-sm">
              <q-badge
                v-if="parentActive"
                color="orange"
                text-color="black"
                :label="t('app.parentBadge')"
              />
              <q-btn
                v-if="parentActive && !tourPending"
                flat
                round
                dense
                icon="logout"
                color="orange"
                :aria-label="t('sideMenu.logout')"
                @click="confirmLogout"
              />
            </div>
          </q-toolbar>
        </q-header>

        <SideMenu v-if="!needsSetup" v-model="menuOpen" />

        <q-page-container>
          <q-banner v-if="!persistence" class="bg-warning text-black">
            {{ t('app.storageUnavailable') }}
          </q-banner>
          <div v-if="settingsStore.loaded" class="page-stack app-column">
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
      <OnboardingDialog v-if="needsSetup" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { ROUTES, APP_NAME } from '@/shared/config/constants';
import { applyLocale, currentLocale } from '@/shared/i18n';
import { formatDayKeyLong } from '@/shared/lib/date';
import { isPersistenceAvailable } from '@/shared/api/db';
import { recordVersion } from '@/entities/app-version';
import { useAccountStore } from '@/entities/account';
import { useParentSessionStore } from '@/entities/parent-session';
import { useSettingsStore } from '@/entities/settings';
import { useSelectedDateStore } from '@/features/select-date';
import { useParentAutoLogout } from '@/features/parent-auto-logout';
import { useLogout } from '@/features/parent-login';
import { SideMenu } from '@/widgets/side-menu';
import { OnboardingDialog } from '@/pages/onboarding';

const $q = useQuasar();
const { t } = useI18n();
const persistence = isPersistenceAvailable();
const { selectedDate } = storeToRefs(useSelectedDateStore());
const { active: parentActive } = storeToRefs(useParentSessionStore());
const appVersion = __APP_VERSION__;
const settingsStore = useSettingsStore();
const account = useAccountStore();
const menuOpen = ref(false);
const confirmLogout = useLogout();
const tourPending = computed(() => settingsStore.settings?.tourPending === true);

useParentAutoLogout();

const route = useRoute();
const router = useRouter();

watch(parentActive, (active) => {
  if (!active && route.meta.parentOnly === true) {
    void router.replace(ROUTES.home);
  }
});

watch(
  () => settingsStore.settings?.locale,
  (locale) => applyLocale(locale ?? currentLocale()),
  { immediate: true }
);

const needsSetup = computed(() => settingsStore.loaded && !settingsStore.settings?.parentPin);

const dateLabel = computed(() => {
  const label = formatDayKeyLong(selectedDate.value);
  return label.charAt(0).toUpperCase() + label.slice(1);
});

declare global {
  interface Window {
    __kidsWhatsNew?: () => void;
  }
}

onMounted(async () => {
  void account.refresh();
  try {
    const { isNew, hadHistory } = await recordVersion(appVersion);
    if (isNew && hadHistory) {
      window.__kidsWhatsNew = () => {
        void router.push(ROUTES.whatsNew);
      };
      $q.notify({
        html: true,
        message: `<span onclick="window.__kidsWhatsNew()" style="cursor:pointer;display:block">${t('app.updated', { version: appVersion })}</span>`,
        icon: 'system_update',
        color: 'dark',
        textColor: 'white',
        timeout: 5000,
      });
    }
  } catch {}
});
</script>
