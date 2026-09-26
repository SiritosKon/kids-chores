export const STREAK_BADGE_MIN_DAYS = 2;

export const isStreakShown = (current: number): boolean => current >= STREAK_BADGE_MIN_DAYS;
