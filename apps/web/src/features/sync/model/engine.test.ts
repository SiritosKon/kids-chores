import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { syncPushRequestSchema, type SyncMutation, type SyncRecord } from '@kids-chores/contracts';
import { db } from '@/shared/api/db';
import { childrenCatalogue, createChild } from '@/entities/child';
import { getAllCompletions, saveDayMarks } from '@/entities/completion';
import { seedPresets } from '@/features/starter-presets';
import { syncFamily, pendingChanges } from './engine';

const DAY = '2026-10-27';

const createServer = () => {
  const records = new Map<string, SyncRecord>();
  const pushed: SyncMutation[] = [];
  let last = 0;

  const save = (record: Omit<SyncRecord, 'changeNumber'>): void => {
    last += 1;
    records.set(`${record.kind}/${record.id}`, { ...record, changeNumber: last });
  };

  const handle = async (input: string, init?: RequestInit): Promise<Response> => {
    if (input.startsWith('/v1/sync/push')) {
      const { mutations } = syncPushRequestSchema.parse(JSON.parse(String(init?.body)));
      for (const mutation of mutations) {
        pushed.push(mutation);
        const current = records.get(`${mutation.kind}/${mutation.id}`);
        const data = Object.fromEntries(
          Object.entries({ ...current?.data, ...(mutation.op === 'put' ? mutation.fields : {}) }).filter(
            ([, value]) => value !== null
          )
        );
        save({ kind: mutation.kind, id: mutation.id, data, deleted: mutation.op === 'delete' });
      }
      return Response.json({ applied: mutations.length, rejected: [], lastChangeNumber: last });
    }
    const since = Number(new URL(input, 'http://localhost').searchParams.get('since'));
    const page = [...records.values()].filter((record) => record.changeNumber > since);
    return Response.json({ records: page, lastChangeNumber: page.at(-1)?.changeNumber ?? since, more: false });
  };

  return { records, pushed, save, handle };
};

let server: ReturnType<typeof createServer>;

beforeEach(async () => {
  if (db.isOpen()) {
    db.close();
  }
  await db.delete();
  await db.open();
  server = createServer();
  vi.stubGlobal('fetch', vi.fn(server.handle));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const familyChild = (id: string, name: string): Omit<SyncRecord, 'changeNumber'> => ({
  kind: 'children',
  id,
  deleted: false,
  data: { name, carColor: '#0A84FF', order: 0, active: true, createdAt: 100, updatedAt: 100 },
});

describe('syncFamily', () => {
  it('sends the guest data to the family on the first sign-in, without photos', async () => {
    const child = await createChild({ name: 'Тимофей', carColor: '#0A84FF', photo: 'data:image/png;base64,AAAA' });
    await saveDayMarks(child.id, DAY, [{ taskId: 'teeth', points: 2 }]);

    const report = await syncFamily('family-1');

    expect(report).toEqual({ changed: false, rejected: 0 });
    expect(server.records.get(`children/${child.id}`)?.data).not.toHaveProperty('photo');
    expect(server.records.get(`children/${child.id}`)?.data.name).toBe('Тимофей');
    expect(server.records.has(`completions/${child.id}:teeth:${DAY}`)).toBe(true);
    expect(await pendingChanges()).toBe(0);
  });

  it('takes the family data on a device with nothing but untouched presets', async () => {
    await seedPresets();
    server.save(familyChild('mia', 'Mia'));

    const report = await syncFamily('family-1');

    expect(report.changed).toBe(true);
    expect((await childrenCatalogue.read()).map((child) => child.name)).toEqual(['Mia']);
    expect(server.pushed).toEqual([]);
  });

  it('brings in changes from another device and keeps the photo on this one', async () => {
    const child = await createChild({ name: 'Тимофей', carColor: '#0A84FF', photo: 'data:image/png;base64,AAAA' });
    await syncFamily('family-1');
    const stored = server.records.get(`children/${child.id}`);
    server.save({ kind: 'children', id: child.id, deleted: false, data: { ...stored?.data, name: 'Тима' } });

    const report = await syncFamily('family-1');

    expect(report.changed).toBe(true);
    expect(await childrenCatalogue.get(child.id)).toMatchObject({ name: 'Тима', photo: 'data:image/png;base64,AAAA' });
    expect(server.pushed.filter((mutation) => mutation.id === child.id)).toHaveLength(1);
  });

  it('sends an unmarked task as a deletion and removes marks deleted elsewhere', async () => {
    const child = await createChild({ name: 'Тимофей', carColor: '#0A84FF', photo: '' });
    await saveDayMarks(child.id, DAY, [
      { taskId: 'teeth', points: 2 },
      { taskId: 'bed', points: 2 },
    ]);
    await syncFamily('family-1');

    await saveDayMarks(child.id, DAY, [{ taskId: 'bed', points: 2 }]);
    await syncFamily('family-1');
    expect(server.pushed.at(-1)).toMatchObject({ id: `${child.id}:teeth:${DAY}`, op: 'delete' });

    const bed = server.records.get(`completions/${child.id}:bed:${DAY}`);
    server.save({ kind: 'completions', id: `${child.id}:bed:${DAY}`, data: bed?.data ?? {}, deleted: true });
    await syncFamily('family-1');
    expect(await getAllCompletions()).toEqual([]);
  });

  it('keeps changes on the device while the server is out of reach', async () => {
    await createChild({ name: 'Тимофей', carColor: '#0A84FF', photo: '' });
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new TypeError('offline'))));

    expect(await syncFamily('family-1')).toMatchObject({ failure: 'offline' });
    expect(await pendingChanges()).toBe(1);

    vi.stubGlobal('fetch', vi.fn(server.handle));
    await syncFamily('family-1');
    expect(await pendingChanges()).toBe(0);
    expect(server.records.size).toBe(1);
    await createChild({ name: 'Даня', carColor: '#FF9F0A', photo: '' });
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new TypeError('offline'))));

    expect(await syncFamily('family-1')).toMatchObject({ failure: 'offline' });
    expect(await pendingChanges()).toBe(1);
  });
});
