import { STREAK_BADGE_MIN_DAYS } from './constants';

export const isStreakShown = (current: number): boolean => current >= STREAK_BADGE_MIN_DAYS;
