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
    <div class="side-menu__head">
      <img :src="iconUrl" alt="" class="side-menu__icon" />
      <div class="col">
        <div class="text-subtitle1 text-weight-bold">Домашние дела детей</div>
        <div class="ios-subtitle">v{{ appVersion }}</div>
      </div>
    </div>

    <q-list>
      <q-item clickable :active="isAt(ROUTES.home)" active-class="side-menu__active" @click="open(ROUTES.home)">
        <q-item-section avatar><q-icon name="home" /></q-item-section>
        <q-item-section>Главная</q-item-section>
      </q-item>

      <q-item v-if="!active" clickable @click="login">
        <q-item-section avatar><q-icon name="lock" /></q-item-section>
        <q-item-section>Родительский режим</q-item-section>
      </q-item>
      <template v-else>
        <q-item-label header>Родительский режим</q-item-label>
        <q-item
          clickable
          :active="isAt(ROUTES.settings)"
          active-class="side-menu__active"
          data-tour="settings"
          @click="open(ROUTES.settings)"
        >
          <q-item-section avatar><q-icon name="settings" /></q-item-section>
          <q-item-section>Настройки</q-item-section>
        </q-item>
        <q-item clickable :active="isAt(ROUTES.spends)" active-class="side-menu__active" @click="open(ROUTES.spends)">
          <q-item-section avatar><q-icon name="history" /></q-item-section>
          <q-item-section>История списаний</q-item-section>
        </q-item>
        <q-item clickable @click="exportData">
          <q-item-section avatar><q-icon name="download" /></q-item-section>
          <q-item-section>Экспорт данных</q-item-section>
        </q-item>
        <q-item clickable @click="pickFile">
          <q-item-section avatar><q-icon name="upload" /></q-item-section>
          <q-item-section>Импорт данных</q-item-section>
        </q-item>
        <q-item v-if="!tourPending" clickable @click="logout">
          <q-item-section avatar><q-icon name="logout" /></q-item-section>
          <q-item-section>Выйти из режима</q-item-section>
        </q-item>
      </template>

      <q-separator spaced />
      <q-item clickable :active="isAt(ROUTES.whatsNew)" active-class="side-menu__active" @click="open(ROUTES.whatsNew)">
        <q-item-section avatar><q-icon name="auto_awesome" /></q-item-section>
        <q-item-section>Что нового</q-item-section>
      </q-item>
      <q-item
        v-if="installable"
        clickable
        :active="isAt(ROUTES.install)"
        active-class="side-menu__active"
        @click="open(ROUTES.install)"
      >
        <q-item-section avatar><q-icon name="add_to_home_screen" /></q-item-section>
        <q-item-section>Как добавить на экран</q-item-section>
      </q-item>
    </q-list>
  </q-drawer>

  <input ref="fileInput" type="file" accept="application/json" style="display: none" @change="onFile" />
  <PinDialog v-model="showLogin" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { ROUTES } from '@/shared/config/constants';
import { useParentSessionStore } from '@/entities/parent-session';
import { useSettingsStore } from '@/entities/settings';
import { PinDialog } from '@/features/parent-login';
import { canAddToHomeScreen } from '@/features/install-app';
import { exportAll, importAll, downloadJson } from '@/features/backup';
import { recalculateStreaks } from '@/features/track-streak';

defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ 'update:modelValue': [open: boolean] }>();

const $q = useQuasar();
const parentSession = useParentSessionStore();
const { active } = storeToRefs(parentSession);
const settingsStore = useSettingsStore();
const tourPending = computed(() => settingsStore.settings?.tourPending === true);

const appVersion = __APP_VERSION__;
const iconUrl = `${import.meta.env.BASE_URL}favicon.svg`;
const showLogin = ref(false);
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
    $q.notify({ type: 'positive', message: 'Импорт выполнен' });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    $q.notify({ type: 'negative', message: `Ошибка импорта: ${reason}` });
  } finally {
    input.value = '';
  }
};
</script>

<style scoped>
.side-menu__head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 16px 12px;
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
