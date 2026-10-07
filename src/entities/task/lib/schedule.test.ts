import { describe, expect, it } from 'vitest';
import { isTaskRequiredOn, tasksRequiredOn, openPeriod, closePeriod, reassignPeriods } from './schedule';

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

describe('isTaskRequiredOn for a child', () => {
  it('requires a task without children from everyone', () => {
    const task = { activePeriods: [{ from: '2026-09-01' }] };

    expect(isTaskRequiredOn(task, '2026-09-10', 'tim')).toBe(true);
  });

  it('requires a task only from the children of the period that covers the day', () => {
    const task = {
      activePeriods: [
        { from: '2026-09-01', to: '2026-09-10' },
        { from: '2026-09-10', childIds: ['tim'] },
      ],
    };

    expect(isTaskRequiredOn(task, '2026-09-05', 'dan')).toBe(true);
    expect(isTaskRequiredOn(task, '2026-09-12', 'dan')).toBe(false);
    expect(isTaskRequiredOn(task, '2026-09-12', 'tim')).toBe(true);
    expect(isTaskRequiredOn(task, '2026-09-12')).toBe(true);
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

describe('openPeriod with children', () => {
  it('opens the new period for the given children', () => {
    expect(openPeriod([], '2026-09-20', ['tim'])).toEqual([{ from: '2026-09-20', childIds: ['tim'] }]);
  });

  it('does not glue periods for different children', () => {
    expect(openPeriod([{ from: '2026-09-01', to: '2026-09-20' }], '2026-09-20', ['tim'])).toEqual([
      { from: '2026-09-01', to: '2026-09-20' },
      { from: '2026-09-20', childIds: ['tim'] },
    ]);
  });
});

describe('closePeriod with children', () => {
  it('keeps the children of the closed period', () => {
    expect(closePeriod([{ from: '2026-09-01', childIds: ['tim'] }], '2026-09-20')).toEqual([
      { from: '2026-09-01', to: '2026-09-20', childIds: ['tim'] },
    ]);
  });
});

describe('reassignPeriods', () => {
  it('keeps the past for the old children and starts today for the new ones', () => {
    expect(reassignPeriods([{ from: '2026-09-01' }], '2026-09-20', ['tim'])).toEqual([
      { from: '2026-09-01', to: '2026-09-20' },
      { from: '2026-09-20', childIds: ['tim'] },
    ]);
  });

  it('rewrites a period opened today instead of leaving an empty one', () => {
    expect(reassignPeriods([{ from: '2026-09-20', childIds: ['tim'] }], '2026-09-20', ['dan'])).toEqual([
      { from: '2026-09-20', childIds: ['dan'] },
    ]);
  });

  it('gives the task back to everyone', () => {
    expect(reassignPeriods([{ from: '2026-09-01', childIds: ['tim'] }], '2026-09-20')).toEqual([
      { from: '2026-09-01', to: '2026-09-20', childIds: ['tim'] },
      { from: '2026-09-20' },
    ]);
  });

  it('leaves a switched-off task alone', () => {
    const periods = [{ from: '2026-09-01', to: '2026-09-10' }];

    expect(reassignPeriods(periods, '2026-09-20', ['tim'])).toEqual(periods);
  });

  it('changes nothing when the children are the same', () => {
    const periods = [{ from: '2026-09-01', childIds: ['tim', 'dan'] }];

    expect(reassignPeriods(periods, '2026-09-20', ['dan', 'tim'])).toEqual(periods);
  });
});
