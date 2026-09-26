import type { BonusSettings, StreakSettings } from './types';

export const SETTINGS_ID = 'app';

export const PARENT_PIN_LENGTH = 6;

export const PIN_PATTERN = /^\d{6}$/;

export const LEGACY_BONUS: BonusSettings = { enabled: true, points: 1 };

export const LEGACY_STREAK: StreakSettings = { enabled: false, milestones: [] };

export const NO_BONUS: BonusSettings = { enabled: false, points: 0 };

export const NO_STREAK: StreakSettings = { enabled: false, milestones: [] };
