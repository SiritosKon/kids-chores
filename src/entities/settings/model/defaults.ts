import { storedSettingsSchema, SETTINGS_ID, type Settings } from './schema';

export const DEFAULT_SETTINGS: Settings = storedSettingsSchema.parse({
  id: SETTINGS_ID,
  parentPassword: '54694945',
});
