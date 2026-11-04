import { describe, expect, it } from 'vitest';
import { changedFields, changeTime, stableJson, syncedFields, touchesTables } from './fields';

describe('sync fields', () => {
  it('keeps the id and device-only fields out of what is synced', () => {
    expect(syncedFields({ id: 'c1', name: 'Mia', photo: 'data:', goal: undefined }, ['photo'])).toEqual({ name: 'Mia' });
  });

  it('finds changed, added and removed fields', () => {
    expect(changedFields({ name: 'Mia', order: 0, goal: { rewardId: 'r1' } }, { name: 'Mila', order: 0, color: 'red' })).toEqual({
      name: 'Mila',
      color: 'red',
      goal: null,
    });
    expect(changedFields(undefined, { name: 'Mia' })).toEqual({ name: 'Mia' });
  });

  it('does not see a change in the order of object keys', () => {
    expect(stableJson({ a: 1, b: { c: 2, d: 3 } })).toBe(stableJson({ b: { d: 3, c: 2 }, a: 1 }));
    expect(changedFields({ goal: { rewardId: 'r1', variantId: 'v1' } }, { goal: { variantId: 'v1', rewardId: 'r1' } })).toEqual({});
  });

  it('takes the latest of the time fields or now', () => {
    expect(changeTime({ id: 's1', createdAt: 100, chosenAt: 300 }, ['createdAt', 'chosenAt'], 999)).toBe(300);
    expect(changeTime({ id: 'app' }, [], 999)).toBe(999);
  });

  it('tells when a write touched one of the synced tables', () => {
    expect(touchesTables({ 'idb://kids-chores/rewards/': {} }, ['rewards'])).toBe(true);
    expect(touchesTables({ 'idb://kids-chores/rewardVariants/': {} }, ['rewards'])).toBe(false);
    expect(touchesTables({ 'idb://kids-chores/syncQueue/': {} }, ['rewards'])).toBe(false);
  });
});
