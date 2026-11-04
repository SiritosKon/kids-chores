import { describe, expect, it } from 'vitest';
import { groupByDay } from './groupByDay';

interface Row {
  id: string;
  day: string;
}

const dayOf = (row: Row): string => row.day;

describe('groupByDay', () => {
  it('puts the latest day first', () => {
    const groups = groupByDay<Row>(
      [
        { id: 'a', day: '2026-09-24' },
        { id: 'b', day: '2026-09-26' },
        { id: 'c', day: '2026-09-25' },
      ],
      dayOf
    );

    expect(groups.map((group) => group.day)).toEqual(['2026-09-26', '2026-09-25', '2026-09-24']);
  });

  it('keeps the incoming order inside a day', () => {
    const groups = groupByDay<Row>(
      [
        { id: 'late', day: '2026-09-26' },
        { id: 'other', day: '2026-09-25' },
        { id: 'early', day: '2026-09-26' },
      ],
      dayOf
    );

    expect(groups[0]?.items.map((row) => row.id)).toEqual(['late', 'early']);
  });

  it('returns nothing for an empty list', () => {
    expect(groupByDay<Row>([], dayOf)).toEqual([]);
  });
});
