export interface DayGroup<Item> {
  day: string;
  items: Item[];
}

export const groupByDay = <Item>(
  items: readonly Item[],
  dayOf: (item: Item) => string
): DayGroup<Item>[] => {
  const groups = new Map<string, Item[]>();
  for (const item of items) {
    const day = dayOf(item);
    const group = groups.get(day) ?? [];
    group.push(item);
    groups.set(day, group);
  }
  return [...groups.entries()]
    .sort(([first], [second]) => second.localeCompare(first))
    .map(([day, grouped]) => ({ day, items: grouped }));
};
