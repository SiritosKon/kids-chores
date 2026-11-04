import { liveQuery, type Subscription } from 'dexie';
import { table } from '@/shared/api/db';
import type { Locale } from '@/shared/i18n';
import { settingsSchema, storedSettingsSchema } from '../model/schema';
import { SETTINGS_ID, INITIAL_BONUS, NO_STREAK } from '../model/constants';
import { hashPin } from '../lib/pinHash';
import type { Settings } from '../model/types';

export const settingsTable = table<Settings>('settings');

export const getSettings = async (): Promise<Settings | undefined> => {
  const row = await settingsTable.get(SETTINGS_ID);
  return row ? storedSettingsSchema.parse(row) : undefined;
};

export const saveSettings = async (settings: Settings): Promise<void> => {
  await settingsTable.put(settingsSchema.parse(settings));
};

export const watchSettings = (onNext: (settings: Settings | undefined) => void): Subscription =>
  liveQuery(getSettings).subscribe({ next: onNext });

export const setupParentPin = async (pin: string, locale: Locale): Promise<void> => {
  const pinHash = await hashPin(pin);
  const existing = await getSettings();
  await saveSettings(
    existing
      ? { ...existing, parentPin: null, pinHash }
      : { id: SETTINGS_ID, parentPin: null, pinHash, bonus: INITIAL_BONUS, streak: NO_STREAK, tourPending: true, locale }
  );
};
