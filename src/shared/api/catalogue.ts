import { liveQuery, type Subscription } from 'dexie';
import { table } from './db';
import type { CatalogueRow } from './types';

export const createCatalogue = <Row extends CatalogueRow>(
  name: string,
  parse: (rows: unknown) => Row[]
) => {
  const rows = table<Row>(name);
  const read = async (): Promise<Row[]> => parse(await rows.orderBy('order').toArray());

  const write = async (items: readonly Row[]): Promise<void> => {
    await rows.bulkPut(parse(items));
  };

  const get = async (id: string): Promise<Row | undefined> => {
    const row = await rows.get(id);
    return row ? parse([row])[0] : undefined;
  };

  const update = async (id: string, patch: Partial<Omit<Row, 'id'>>): Promise<void> => {
    const row = await get(id);
    if (row) {
      await write([{ ...row, ...patch, updatedAt: Date.now() }]);
    }
  };

  const archive = async (id: string, patch: Partial<Omit<Row, 'id'>> = {}): Promise<void> => {
    const row = await get(id);
    if (row) {
      const now = Date.now();
      await write([{ ...row, ...patch, active: false, archivedAt: now, updatedAt: now }]);
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
    put: (row: Row): Promise<void> => write([row]),
    putMany: (items: Row[]): Promise<void> => write(items),
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
