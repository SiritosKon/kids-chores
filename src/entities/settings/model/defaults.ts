import { storedSettingsSchema, SETTINGS_ID, DEFAULT_PARENT_PIN, type Settings } from './schema';

export const DEFAULT_SETTINGS: Settings = storedSettingsSchema.parse({
  id: SETTINGS_ID,
  parentPin: DEFAULT_PARENT_PIN,
});
