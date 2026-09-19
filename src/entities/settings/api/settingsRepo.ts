import { liveQuery, type Subscription } from 'dexie';
import { table } from '@/shared/api/db';
import { storedSettingsSchema, SETTINGS_ID, type Settings } from '../model/schema';

export const settingsTable = table<Settings>('settings');

export const getSettings = async (): Promise<Settings | undefined> => {
  const row = await settingsTable.get(SETTINGS_ID);
  return row ? storedSettingsSchema.parse(row) : undefined;
};

export const saveSettings = async (settings: Settings): Promise<void> => {
  await settingsTable.put(settings);
};

export const watchSettings = (onNext: (settings: Settings | undefined) => void): Subscription =>
  liveQuery(getSettings).subscribe({ next: onNext });
