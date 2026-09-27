import { describe, expect, it } from 'vitest';
import { isTaskRequiredOn, tasksRequiredOn, openPeriod, closePeriod } from './schedule';

describe('isTaskRequiredOn', () => {
  it('requires a task from the first day of its period', () => {
    const task = { activePeriods: [{ from: '2026-09-20' }] };

    expect(isTaskRequiredOn(task, '2026-09-19')).toBe(false);
    expect(isTaskRequiredOn(task, '2026-09-20')).toBe(true);
    expect(isTaskRequiredOn(task, '2026-12-31')).toBe(true);
  });

  it('stops requiring a task on the day its period closes', () => {
    const task = { activePeriods: [{ from: '2026-09-01', to: '2026-09-20' }] };

    expect(isTaskRequiredOn(task, '2026-09-19')).toBe(true);
    expect(isTaskRequiredOn(task, '2026-09-20')).toBe(false);
  });

  it('skips the gap between two periods', () => {
    const task = {
      activePeriods: [{ from: '2026-09-01', to: '2026-09-10' }, { from: '2026-09-15' }],
    };

    expect(isTaskRequiredOn(task, '2026-09-12')).toBe(false);
    expect(isTaskRequiredOn(task, '2026-09-16')).toBe(true);
  });
});

describe('tasksRequiredOn', () => {
  it('keeps only the tasks due that day, in order', () => {
    const tasks = [
      { id: 'old', activePeriods: [{ from: '0000-01-01' }] },
      { id: 'new', activePeriods: [{ from: '2026-09-26' }] },
    ];

    expect(tasksRequiredOn(tasks, '2026-09-25').map((task) => task.id)).toEqual(['old']);
    expect(tasksRequiredOn(tasks, '2026-09-26').map((task) => task.id)).toEqual(['old', 'new']);
  });
});

describe('closePeriod', () => {
  it('ends the open period on the given day', () => {
    expect(closePeriod([{ from: '2026-09-01' }], '2026-09-20')).toEqual([
      { from: '2026-09-01', to: '2026-09-20' },
    ]);
  });

  it('drops a period that would end before it starts', () => {
    expect(closePeriod([{ from: '2026-09-20' }], '2026-09-20')).toEqual([]);
  });

  it('leaves a closed history alone', () => {
    const periods = [{ from: '2026-09-01', to: '2026-09-10' }];

    expect(closePeriod(periods, '2026-09-20')).toEqual(periods);
  });
});

describe('openPeriod', () => {
  it('starts a new period after a gap', () => {
    expect(openPeriod([{ from: '2026-09-01', to: '2026-09-10' }], '2026-09-20')).toEqual([
      { from: '2026-09-01', to: '2026-09-10' },
      { from: '2026-09-20' },
    ]);
  });

  it('reopens a period closed the same day instead of leaving a hole', () => {
    expect(openPeriod([{ from: '2026-09-01', to: '2026-09-20' }], '2026-09-20')).toEqual([
      { from: '2026-09-01' },
    ]);
  });

  it('keeps an already open period', () => {
    expect(openPeriod([{ from: '2026-09-01' }], '2026-09-20')).toEqual([{ from: '2026-09-01' }]);
  });
});
