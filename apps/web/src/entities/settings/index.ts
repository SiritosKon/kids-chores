export { settingsSchema, storedSettingsSchema, parentPinSchema, pinHashSchema, isValidPin } from './model/schema';
export { SETTINGS_ID, PARENT_PIN_LENGTH } from './model/constants';
export type { Settings, BonusSettings, StreakSettings, StreakMilestone, PinHash } from './model/types';
export { useSettingsStore } from './model/store';
export { getSettings, saveSettings, setupParentPin, settingsTable } from './api/settingsRepo';
export {
  openMilestones,
  addMilestone,
  changeMilestone,
  removeMilestone,
  isStageDaysTaken,
  milestonesFor,
} from './lib/milestones';
export type { MilestoneRule } from './lib/types';
