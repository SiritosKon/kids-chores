import {
  storedSettingsSchema,
  SETTINGS_ID,
  SETTINGS_SEED_VERSION,
  DEFAULT_PARENT_PIN,
  type Settings,
} from './schema';

export const DEFAULT_SETTINGS: Settings = storedSettingsSchema.parse({
  id: SETTINGS_ID,
  seedVersion: SETTINGS_SEED_VERSION,
  parentPin: DEFAULT_PARENT_PIN,
});
