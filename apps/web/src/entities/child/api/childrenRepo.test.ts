import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/shared/api/db';
import { childrenCatalogue, createChild, updateChild, archiveChild } from './childrenRepo';

beforeEach(async () => {
  if (db.isOpen()) {
    db.close();
  }
  await db.delete();
  await db.open();
});

describe('children repository', () => {
  it('appends a new child after the existing ones', async () => {
    const first = await createChild({ name: 'Аня', carColor: '#42A5F5', photo: '' });
    const second = await createChild({ name: 'Боря', carColor: '#EF5350', photo: '' });

    expect(first.order).toBe(0);
    expect(second.order).toBe(1);
    expect((await childrenCatalogue.read()).map((child) => child.name)).toEqual(['Аня', 'Боря']);
  });

  it('updates the fields of a draft and keeps the rest', async () => {
    const child = await createChild({ name: 'Аня', carColor: '#42A5F5', photo: '' });

    await updateChild(child.id, { name: 'Анна', carColor: '#30D158', photo: 'data:image/jpeg;base64,AA' });

    const [stored] = await childrenCatalogue.read();
    expect(stored).toMatchObject({ id: child.id, name: 'Анна', carColor: '#30D158', order: 0 });
    expect(stored?.createdAt).toBe(child.createdAt);
  });

  it('archives a child instead of deleting the row', async () => {
    const child = await createChild({ name: 'Аня', carColor: '#42A5F5', photo: '' });

    await archiveChild(child.id);

    const [stored] = await childrenCatalogue.read();
    expect(stored?.active).toBe(false);
    expect(stored?.archivedAt).toBeTypeOf('number');
  });
});
