import { ref, computed, onScopeDispose } from 'vue';
import { defineStore } from 'pinia';
import { getSettings, saveSettings, watchSettings } from '../api/settingsRepo';
import { hashPin, pinMatches } from '../lib/pinHash';
import { NO_BONUS, NO_STREAK } from './constants';
import type { Settings } from './types';

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<Settings | null>(null);
  const loaded = ref(false);

  let hashingLegacyPin = false;

  const bonus = computed(() => settings.value?.bonus ?? NO_BONUS);
  const streak = computed(() => settings.value?.streak ?? NO_STREAK);
  const hasPin = computed(() => Boolean(settings.value?.pinHash ?? settings.value?.parentPin));

  const update = async (patch: Partial<Omit<Settings, 'id'>>): Promise<void> => {
    const current = await getSettings();
    if (!current) {
      throw new Error('settings are not created yet');
    }
    await saveSettings({ ...current, ...patch });
  };

  const changePin = async (pin: string): Promise<void> => {
    await update({ parentPin: null, pinHash: await hashPin(pin) });
  };

  const checkPin = async (pin: string): Promise<boolean> => {
    const current = settings.value;
    if (current?.pinHash) {
      return pinMatches(pin, current.pinHash);
    }
    return current?.parentPin === pin;
  };

  const hashLegacyPin = (row: Settings): void => {
    if (!row.parentPin || row.pinHash || hashingLegacyPin) {
      return;
    }
    hashingLegacyPin = true;
    void changePin(row.parentPin).finally(() => {
      hashingLegacyPin = false;
    });
  };

  const subscription = watchSettings((row) => {
    settings.value = row ?? null;
    loaded.value = true;
    if (row) {
      hashLegacyPin(row);
    }
  });
  onScopeDispose(() => subscription.unsubscribe());

  return { settings, loaded, bonus, streak, hasPin, update, changePin, checkPin };
});
