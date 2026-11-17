import { PRESET_ID_PREFIX, PRESET_TIME, STREAK_AWARD_PREFIX } from './constants';
import type { RowIdentity } from './types';

export const completionId = (childId: string, taskId: string, date: string): string =>
  `${childId}:${taskId}:${date}`;

export const isStreakAwardId = (id: string): boolean => id.startsWith(STREAK_AWARD_PREFIX);

export const streakAwardId = (childId: string, milestoneId: string, day: string): string =>
  `${STREAK_AWARD_PREFIX}${childId}:${milestoneId}:${day}`;

export const newIdentity = (): RowIdentity => ({ id: crypto.randomUUID(), at: Date.now() });

export const presetIdentity = (name: string): RowIdentity => ({ id: `${PRESET_ID_PREFIX}${name}`, at: PRESET_TIME });

export const isUntouchedPreset = (row: { id: string; updatedAt: number }): boolean =>
  row.id.startsWith(PRESET_ID_PREFIX) && row.updatedAt === PRESET_TIME;
