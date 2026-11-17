import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import type { SyncFields, SyncMutation } from '@kids-chores/contracts';
import { DELETED_FIELD } from './constants';
import { deletedAt, mergeRecord } from './lib';

const mutation = (fields: SyncFields, changedAt: number, op: SyncMutation['op'] = 'put'): SyncMutation => ({
  mutationId: randomUUID(),
  schemaVersion: 1,
  kind: 'children',
  id: 'child-1',
  op,
  fields,
  changedAt,
});

const NOW = 1_000_000;

describe('mergeRecord', () => {
  it('creates a record from the first change', () => {
    const merged = mergeRecord(null, mutation({ name: 'Mia', order: 0 }, 100), NOW);
    expect(merged).toEqual({
      data: { name: 'Mia', order: 0 },
      fieldChangedAt: { name: 100, order: 100, [DELETED_FIELD]: 100 },
      deleted: false,
    });
  });

  it('keeps changes to different fields from two devices', () => {
    const first = mergeRecord(null, mutation({ name: 'Mia', order: 0 }, 100), NOW);
    const second = mergeRecord(first, mutation({ order: 3 }, 150), NOW);
    const third = mergeRecord(second, mutation({ name: 'Mila' }, 120), NOW);
    expect(third.data).toEqual({ name: 'Mila', order: 3 });
  });

  it('lets the later change win a field, not the later arrival', () => {
    const fresh = mergeRecord(null, mutation({ name: 'Fresh' }, 200), NOW);
    const stale = mergeRecord(fresh, mutation({ name: 'Stale' }, 100), NOW);
    expect(stale.data.name).toBe('Fresh');
    expect(stale.fieldChangedAt.name).toBe(200);
  });

  it('lets the later arrival win a tie', () => {
    const first = mergeRecord(null, mutation({ name: 'First' }, 100), NOW);
    expect(mergeRecord(first, mutation({ name: 'Second' }, 100), NOW).data.name).toBe('Second');
  });

  it('replaces a time from the future with the server time', () => {
    const future = mergeRecord(null, mutation({ name: 'Future' }, NOW * 10), NOW);
    expect(future.fieldChangedAt.name).toBe(NOW);
    expect(mergeRecord(future, mutation({ name: 'Now' }, NOW), NOW).data.name).toBe('Now');
  });

  it('drops a field that was cleared', () => {
    const first = mergeRecord(null, mutation({ name: 'Mia', goal: { rewardId: 'r1' } }, 100), NOW);
    const cleared = mergeRecord(first, mutation({ goal: null }, 200), NOW);
    expect(cleared.data).toEqual({ name: 'Mia' });
    expect(cleared.fieldChangedAt.goal).toBe(200);
  });

  it('marks a record deleted and keeps it deleted against older changes', () => {
    const created = mergeRecord(null, mutation({ points: 2 }, 100), NOW);
    const removed = mergeRecord(created, mutation({}, 200, 'delete'), NOW);
    expect(removed.deleted).toBe(true);
    expect(deletedAt(removed)).toEqual(new Date(200));
    expect(mergeRecord(removed, mutation({ points: 3 }, 150), NOW).deleted).toBe(true);
  });

  it('brings a record back with a change made after the deletion', () => {
    const removed = mergeRecord(mergeRecord(null, mutation({ points: 2 }, 100), NOW), mutation({}, 200, 'delete'), NOW);
    const back = mergeRecord(removed, mutation({ points: 3 }, 300), NOW);
    expect(back.deleted).toBe(false);
    expect(back.data.points).toBe(3);
    expect(deletedAt(back)).toBeNull();
  });
});
