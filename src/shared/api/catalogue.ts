import { liveQuery, type Subscription } from 'dexie';
import { table } from './db';
import type { CatalogueRow } from './types';

export const createCatalogue = <Row extends CatalogueRow>(
  name: string,
  parse: (rows: unknown) => Row[]
) => {
  const rows = table<Row>(name);
  const read = async (): Promise<Row[]> => parse(await rows.orderBy('order').toArray());

  const get = async (id: string): Promise<Row | undefined> => {
    const row = await rows.get(id);
    return row ? parse([row])[0] : undefined;
  };

  const update = async (id: string, patch: Partial<Omit<Row, 'id'>>): Promise<void> => {
    const row = await get(id);
    if (row) {
      await rows.put({ ...row, ...patch, updatedAt: Date.now() });
    }
  };

  const archive = async (id: string, patch: Partial<Omit<Row, 'id'>> = {}): Promise<void> => {
    const row = await get(id);
    if (row) {
      const now = Date.now();
      await rows.put({ ...row, ...patch, active: false, archivedAt: now, updatedAt: now });
    }
  };

  return {
    table: rows,
    read,
    get,
    update,
    archive,
    nextOrder: async (): Promise<number> => ((await rows.orderBy('order').last())?.order ?? -1) + 1,
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
