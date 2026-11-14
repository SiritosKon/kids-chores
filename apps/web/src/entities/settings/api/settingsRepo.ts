import { liveQuery, type Subscription } from 'dexie';
import { table } from '@/shared/api/db';
import type { Locale } from '@/shared/i18n';
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

export const setupSettings = async (locale: Locale): Promise<void> => {
  if (await getSettings()) {
    return;
  }
  await saveSettings({
    id: SETTINGS_ID,
    parentPin: null,
    pinHash: null,
    bonus: INITIAL_BONUS,
    streak: NO_STREAK,
    tourPending: true,
    locale,
  });
};
