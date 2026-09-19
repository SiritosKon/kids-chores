import { liveQuery, type Subscription } from 'dexie';
import { table } from './db';

export interface CatalogueRow {
  id: string;
  order: number;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

export const createCatalogue = <Row extends CatalogueRow>(
  name: string,
  parse: (rows: unknown) => Row[]
) => {
  const rows = table<Row>(name);
  const read = async (): Promise<Row[]> => parse(await rows.orderBy('order').toArray());

  return {
    table: rows,
    read,
    watch: (onNext: (items: Row[]) => void): Subscription =>
      liveQuery(read).subscribe({ next: onNext }),
    count: (): Promise<number> => rows.count(),
    existingIds: async (): Promise<Set<string>> => new Set(await rows.toCollection().primaryKeys()),
    put: async (row: Row): Promise<void> => {
      await rows.put(row);
    },
    putMany: async (items: Row[]): Promise<void> => {
      await rows.bulkPut(items);
    },
  };
};

export const withCatalogueDefaults = <Seed extends { id: string }>(
  seeds: readonly Seed[],
  now = Date.now()
): (Seed & CatalogueRow)[] =>
  seeds.map((seed, index) => ({
    order: index,
    active: true,
    createdAt: now,
    updatedAt: now,
    ...seed,
  }));
