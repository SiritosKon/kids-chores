import type { SpecSource, SyncRow, SyncSpec } from '../model/types';

export const defineSpec = <Row extends SyncRow>(source: SpecSource<Row>): SyncSpec => ({
  kind: source.kind,
  table: source.table,
  timeFields: source.timeFields,
  localFields: source.localFields ?? [],
  localDefaults: source.localDefaults ?? (() => ({})),
  read: source.read,
  get: (id) => source.table.get(id),
  store: async (row) => {
    const parsed = source.schema.safeParse(row);
    if (!parsed.success) {
      return null;
    }
    await source.table.put(parsed.data);
    return parsed.data;
  },
  remove: (id) => source.table.delete(id),
  clear: () => source.table.clear(),
});
