import { ref, onScopeDispose } from 'vue';
import { defineStore } from 'pinia';
import { getSettings, saveSettings, watchSettings } from '../api/settingsRepo';
import { DEFAULT_SETTINGS } from './defaults';
import type { Settings } from './schema';

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<Settings>(DEFAULT_SETTINGS);
  const loaded = ref(false);

  const subscription = watchSettings((row) => {
    settings.value = row ?? DEFAULT_SETTINGS;
    loaded.value = true;
  });
  onScopeDispose(() => subscription.unsubscribe());

  const update = async (patch: Partial<Omit<Settings, 'id'>>): Promise<void> => {
    const current = (await getSettings()) ?? DEFAULT_SETTINGS;
    await saveSettings({ ...current, ...patch });
  };

  return { settings, loaded, update };
});
