import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '@/shared/api/db';
import { childrenCatalogue, createChild, updateChild } from '@/entities/child';
import { saveVariants, variantPhotosTable, variantsCatalogue } from '@/entities/reward';
import { syncPhotos } from './engine';

const JPEG = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ==';
const OTHER = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAg==';

const createServer = () => {
  const files = new Map<string, ArrayBuffer>();
  const calls: string[] = [];
  let next = 0;
  const handle = async (input: string, init?: RequestInit): Promise<Response> => {
    const method = init?.method ?? 'GET';
    calls.push(`${method} ${input}`);
    if (method === 'POST') {
      next += 1;
      const id = `00000000-0000-4000-8000-${String(next).padStart(12, '0')}`;
      const body = init?.body;
      if (!(body instanceof Blob)) {
        return new Response(null, { status: 400 });
      }
      files.set(id, await body.arrayBuffer());
      return Response.json({ id }, { status: 201 });
    }
    const id = input.split('/').pop() ?? '';
    if (method === 'DELETE') {
      files.delete(id);
      return new Response(null, { status: 204 });
    }
    const file = files.get(id);
    return file ? new Response(new Blob([file], { type: 'image/jpeg' })) : new Response(null, { status: 404 });
  };
  return { files, calls, handle };
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

describe('syncPhotos', () => {
  it('uploads a photo taken on this device and shares only its id', async () => {
    const child = await createChild({ name: 'Аня', carColor: '#42A5F5', photo: JPEG });
    await syncPhotos();
    const stored = await childrenCatalogue.get(child.id);
    expect(stored?.photoId).toBeDefined();
    expect(stored?.photoSyncedId).toBe(stored?.photoId);
    expect(stored?.photoPending).toBe(false);
    expect(server.files.size).toBe(1);
    await syncPhotos();
    expect(server.calls.filter((call) => call.startsWith('POST'))).toHaveLength(1);
  });

  it('uploads photos from before the account once', async () => {
    const child = await createChild({ name: 'Боря', carColor: '#42A5F5', photo: '' });
    await childrenCatalogue.table.update(child.id, { photo: JPEG, photoPending: undefined });
    await syncPhotos();
    expect((await childrenCatalogue.get(child.id))?.photoId).toBeDefined();
  });

  it('downloads a photo another device shared and drops it when that device removes it', async () => {
    const child = await createChild({ name: 'Вера', carColor: '#42A5F5', photo: JPEG });
    await syncPhotos();
    const photoId = (await childrenCatalogue.get(child.id))?.photoId;
    await childrenCatalogue.table.update(child.id, { photo: '', photoSyncedId: undefined });

    expect(await syncPhotos()).toBe(true);
    expect((await childrenCatalogue.get(child.id))?.photo).toBe(JPEG);
    expect((await childrenCatalogue.get(child.id))?.photoSyncedId).toBe(photoId);

    await childrenCatalogue.table.update(child.id, { photoId: undefined });
    expect(await syncPhotos()).toBe(true);
    expect((await childrenCatalogue.get(child.id))?.photo).toBe('');
  });

  it('replaces the shared photo and deletes the old file, or removes it entirely', async () => {
    const child = await createChild({ name: 'Гоша', carColor: '#42A5F5', photo: JPEG });
    await syncPhotos();
    const first = (await childrenCatalogue.get(child.id))?.photoId ?? '';
    await updateChild(child.id, { name: 'Гоша', carColor: '#42A5F5', photo: OTHER });
    await syncPhotos();
    const second = (await childrenCatalogue.get(child.id))?.photoId ?? '';
    expect(second).not.toBe(first);
    expect(server.files.has(first)).toBe(false);

    await updateChild(child.id, { name: 'Гоша', carColor: '#42A5F5', photo: '' });
    await syncPhotos();
    expect((await childrenCatalogue.get(child.id))?.photoId).toBeUndefined();
    expect(server.files.size).toBe(0);
  });

  it('shares reward variant pictures the same way', async () => {
    await saveVariants('lego', [{ id: null, name: 'Замок', photo: JPEG }], []);
    await syncPhotos();
    const [variant] = await variantsCatalogue.read();
    expect(variant?.photoId).toBeDefined();
    expect((await variantPhotosTable.get(variant?.id ?? ''))?.photoSyncedId).toBe(variant?.photoId);
  });

  it('keeps a local photo and uploads it again when the server lost it', async () => {
    const child = await createChild({ name: 'Даня', carColor: '#42A5F5', photo: JPEG });
    await childrenCatalogue.table.update(child.id, { photoPending: false, photoId: 'missing', photoSyncedId: 'old' });
    await syncPhotos();
    expect((await childrenCatalogue.get(child.id))?.photoPending).toBe(true);
    await syncPhotos();
    expect((await childrenCatalogue.get(child.id))?.photoId).not.toBe('missing');
    expect((await childrenCatalogue.get(child.id))?.photo).toBe(JPEG);
  });
});
