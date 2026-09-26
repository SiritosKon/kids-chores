import { liveQuery, type Subscription } from 'dexie';
import { table } from '@/shared/api/db';
import { settingsSchema, storedSettingsSchema } from '../model/schema';
import { SETTINGS_ID, INITIAL_BONUS, NO_STREAK } from '../model/constants';
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

export const setupParentPin = async (parentPin: string): Promise<void> => {
  const existing = await getSettings();
  await saveSettings(
    existing
      ? { ...existing, parentPin }
      : { id: SETTINGS_ID, parentPin, bonus: INITIAL_BONUS, streak: NO_STREAK, tourPending: true }
  );
};
