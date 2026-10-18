<template>
  <q-drawer
    :model-value="modelValue"
    side="left"
    behavior="mobile"
    overlay
    :width="290"
    class="side-menu bg-grey-10"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="side-menu__body">
      <div class="side-menu__head">
        <img :src="iconUrl" alt="" class="side-menu__icon" />
        <div class="text-subtitle1 text-weight-bold">{{ APP_NAME }}</div>
      </div>

      <q-list class="side-menu__list">
        <q-item clickable :active="isAt(ROUTES.home)" active-class="side-menu__active" @click="open(ROUTES.home)">
          <q-item-section avatar><q-icon name="home" /></q-item-section>
          <q-item-section>{{ t('sideMenu.home') }}</q-item-section>
        </q-item>

        <q-item v-if="!active" clickable @click="login">
          <q-item-section avatar><q-icon name="lock" /></q-item-section>
          <q-item-section>{{ t('sideMenu.parentMode') }}</q-item-section>
        </q-item>
        <template v-else>
          <q-item-label header>{{ t('sideMenu.parentMode') }}</q-item-label>
          <q-item
            clickable
            :active="isAt(ROUTES.settings)"
            active-class="side-menu__active"
            @click="open(ROUTES.settings)"
          >
            <q-item-section avatar><q-icon name="settings" /></q-item-section>
            <q-item-section>{{ t('sideMenu.settings') }}</q-item-section>
          </q-item>
          <q-item clickable :active="isAt(ROUTES.spends)" active-class="side-menu__active" @click="open(ROUTES.spends)">
            <q-item-section avatar><q-icon name="history" /></q-item-section>
            <q-item-section>{{ t('sideMenu.spends') }}</q-item-section>
          </q-item>
          <q-item clickable @click="exportData">
            <q-item-section avatar><q-icon name="download" /></q-item-section>
            <q-item-section>{{ t('sideMenu.exportData') }}</q-item-section>
          </q-item>
          <q-item clickable @click="pickFile">
            <q-item-section avatar><q-icon name="upload" /></q-item-section>
            <q-item-section>{{ t('sideMenu.importData') }}</q-item-section>
          </q-item>
          <q-item v-if="!tourPending" clickable @click="logout">
            <q-item-section avatar><q-icon name="logout" /></q-item-section>
            <q-item-section>{{ t('sideMenu.logout') }}</q-item-section>
          </q-item>
        </template>

        <template v-if="installable">
          <q-separator spaced />
          <q-item clickable :active="isAt(ROUTES.install)" active-class="side-menu__active" @click="open(ROUTES.install)">
            <q-item-section avatar><q-icon name="add_to_home_screen" /></q-item-section>
            <q-item-section>{{ t('sideMenu.install') }}</q-item-section>
          </q-item>
        </template>
      </q-list>

      <div class="side-menu__footer">
        <q-btn flat dense no-caps class="side-menu__footer-btn" :aria-label="t('sideMenu.language')">
          <q-icon name="language" size="20px" />
          <span class="q-ml-xs">{{ LOCALE_NAMES[current] }}</span>
          <q-menu anchor="top left" self="bottom left" class="bg-grey-9">
            <q-list style="min-width: 180px">
              <q-item
                v-for="option in LOCALE_OPTIONS"
                :key="option.value"
                v-close-popup
                clickable
                :active="option.value === current"
                active-class="side-menu__active"
                @click="pickLocale(option.value)"
              >
                <q-item-section>{{ option.label }}</q-item-section>
                <q-item-section v-if="option.value === current" side>
                  <q-icon name="check" color="primary" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <q-space />
        <q-btn
          flat
          dense
          no-caps
          class="side-menu__footer-btn"
          :aria-label="t('sideMenu.whatsNew')"
          @click="open(ROUTES.whatsNew)"
        >
          <span>v{{ appVersion }}</span>
          <q-icon name="help_outline" size="18px" class="q-ml-xs" />
        </q-btn>
      </div>
    </div>
  </q-drawer>

  <input ref="fileInput" type="file" accept="application/json" style="display: none" @change="onFile" />
  <PinDialog v-model="showLogin" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ROUTES, APP_NAME } from '@/shared/config/constants';
import { applyLocale, currentLocale, LOCALE_NAMES, LOCALE_OPTIONS, type Locale } from '@/shared/i18n';
import { useParentSessionStore } from '@/entities/parent-session';
import { useSettingsStore } from '@/entities/settings';
import { PinDialog } from '@/features/parent-login';
import { canAddToHomeScreen } from '@/features/install-app';
import { exportAll, importAll, downloadJson } from '@/features/backup';
import { recalculateStreaks } from '@/features/track-streak';

defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ 'update:modelValue': [open: boolean] }>();

const $q = useQuasar();
const { t } = useI18n();
const parentSession = useParentSessionStore();
const { active } = storeToRefs(parentSession);
const settingsStore = useSettingsStore();
const tourPending = computed(() => settingsStore.settings?.tourPending === true);

const appVersion = __APP_VERSION__;
const iconUrl = `${import.meta.env.BASE_URL}favicon.svg`;
const showLogin = ref(false);
const current = computed(() => currentLocale());
const installable = canAddToHomeScreen();

const route = useRoute();
const router = useRouter();

const close = (): void => {
  emit('update:modelValue', false);
};

const isAt = (path: string): boolean => route.path === path;

const open = (path: string): void => {
  close();
  if (!isAt(path)) {
    void router.push(path);
  }
};

const login = (): void => {
  close();
  showLogin.value = true;
};

const logout = (): void => {
  close();
  parentSession.logout();
};

const pickLocale = async (picked: Locale): Promise<void> => {
  if (settingsStore.settings) {
    await settingsStore.update({ locale: picked });
  } else {
    applyLocale(picked);
  }
};

const fileInput = ref<HTMLInputElement | null>(null);

const exportData = async (): Promise<void> => {
  close();
  const data = await exportAll();
  downloadJson(data, `kids-chores-${data.exportedAt?.slice(0, 10) ?? 'export'}.json`);
};

const pickFile = (): void => {
  close();
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
    await recalculateStreaks();
    $q.notify({ type: 'positive', message: t('sideMenu.imported') });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    $q.notify({ type: 'negative', message: t('sideMenu.importFailed', { reason }) });
  } finally {
    input.value = '';
  }
};
</script>

<style scoped>
.side-menu__body {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.side-menu__head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 16px 12px;
}

.side-menu__list {
  flex: 1 1 auto;
}

.side-menu__footer {
  display: flex;
  align-items: center;
  padding: 8px 8px calc(8px + env(safe-area-inset-bottom));
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.side-menu__footer-btn {
  color: #8e8e93;
  font-size: 13px;
}

.side-menu__icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
}

.side-menu__active {
  color: #ff9f0a;
  background: rgba(255, 159, 10, 0.12);
}
</style>
