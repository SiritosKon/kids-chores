import { ref, computed, onScopeDispose } from 'vue';
import { defineStore } from 'pinia';
import { getSettings, saveSettings, watchSettings } from '../api/settingsRepo';
import type { BonusSettings, Settings, StreakSettings } from './schema';

const NO_BONUS: BonusSettings = { enabled: false, points: 0 };
const NO_STREAK: StreakSettings = { enabled: false, milestones: [] };

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<Settings | null>(null);
  const loaded = ref(false);

  const subscription = watchSettings((row) => {
    settings.value = row ?? null;
    loaded.value = true;
  });
  onScopeDispose(() => subscription.unsubscribe());

  const bonus = computed(() => settings.value?.bonus ?? NO_BONUS);
  const streak = computed(() => settings.value?.streak ?? NO_STREAK);

  const update = async (patch: Partial<Omit<Settings, 'id'>>): Promise<void> => {
    const current = await getSettings();
    if (!current) {
      throw new Error('settings are not created yet');
    }
    await saveSettings({ ...current, ...patch });
  };

  return { settings, loaded, bonus, streak, update };
});
