import { describe, expect, it } from 'vitest';
import { summariseStreak } from './compute';
import type { StreakMilestoneInput } from './types';

const MILESTONES: StreakMilestoneInput[] = [
  { id: 'three-days', days: 3, points: 2 },
  { id: 'week', days: 7, points: 5 },
];

describe('summariseStreak', () => {
  it('counts consecutive closed days', () => {
    const summary = summariseStreak(
      ['2026-09-16', '2026-09-17', '2026-09-18'],
      MILESTONES,
      '2026-09-18'
    );

    expect(summary.current).toBe(3);
    expect(summary.best).toBe(3);
    expect(summary.lastClosedDate).toBe('2026-09-18');
  });

  it('keeps the streak alive while today is still open', () => {
    const summary = summariseStreak(['2026-09-16', '2026-09-17'], MILESTONES, '2026-09-18');

    expect(summary.current).toBe(2);
  });

  it('drops the streak once a day is missed', () => {
    const summary = summariseStreak(['2026-09-16', '2026-09-17'], MILESTONES, '2026-09-19');

    expect(summary.current).toBe(0);
    expect(summary.best).toBe(2);
  });

  it('restarts after a gap but remembers the best run', () => {
    const summary = summariseStreak(
      ['2026-09-10', '2026-09-11', '2026-09-12', '2026-09-16', '2026-09-17'],
      MILESTONES,
      '2026-09-17'
    );

    expect(summary.current).toBe(2);
    expect(summary.best).toBe(3);
  });

  it('fires each stage once, on the day the run reaches it', () => {
    const days = Array.from({ length: 7 }, (_, index) => `2026-09-${10 + index}`);

    const summary = summariseStreak(days, MILESTONES, '2026-09-16');

    expect(summary.current).toBe(7);
    expect(summary.hits.map((hit) => `${hit.milestoneId}@${hit.day}`)).toEqual([
      'three-days@2026-09-12',
      'week@2026-09-16',
    ]);
  });

  it('does not fire a stage again when the run goes on past it', () => {
    const days = Array.from({ length: 21 }, (_, index) => `2026-09-${String(1 + index).padStart(2, '0')}`);

    const summary = summariseStreak(days, [{ id: 'week', days: 7 }], '2026-09-21');

    expect(summary.hits.map((hit) => hit.day)).toEqual(['2026-09-07']);
  });

  it('fires a stage again in a new run after a break', () => {
    const first = Array.from({ length: 3 }, (_, index) => `2026-09-0${1 + index}`);
    const second = Array.from({ length: 3 }, (_, index) => `2026-09-1${index}`);

    const summary = summariseStreak([...first, ...second], [{ id: 'three', days: 3 }], '2026-09-12');

    expect(summary.hits.map((hit) => hit.day)).toEqual(['2026-09-03', '2026-09-12']);
  });

  it('crosses a month boundary', () => {
    const summary = summariseStreak(
      ['2026-09-29', '2026-09-30', '2026-10-01'],
      MILESTONES,
      '2026-10-01'
    );

    expect(summary.current).toBe(3);
    expect(summary.hits).toHaveLength(1);
  });

  it('ignores duplicates and unsorted input', () => {
    const summary = summariseStreak(
      ['2026-09-17', '2026-09-16', '2026-09-17'],
      MILESTONES,
      '2026-09-17'
    );

    expect(summary.current).toBe(2);
  });

  it('ignores days marked ahead of today instead of breaking the run', () => {
    const summary = summariseStreak(
      ['2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20'],
      MILESTONES,
      '2026-09-19'
    );

    expect(summary.current).toBe(3);
    expect(summary.lastClosedDate).toBe('2026-09-19');
  });

  it('counts a day marked ahead only once that day arrives', () => {
    const days = ['2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20'];

    expect(summariseStreak(days, MILESTONES, '2026-09-20').current).toBe(4);
  });

  it('returns nothing for an empty history', () => {
    const summary = summariseStreak([], MILESTONES, '2026-09-17');

    expect(summary).toEqual({ current: 0, best: 0, lastClosedDate: null, hits: [] });
  });
});
