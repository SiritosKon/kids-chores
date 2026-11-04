import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/shared/api/db';
import { variantsCatalogue, saveVariants, getVariantPhotos } from './variantsRepo';

const activeOf = async (rewardId: string) =>
  (await variantsCatalogue.read()).filter((variant) => variant.rewardId === rewardId && variant.active);

beforeEach(async () => {
  if (db.isOpen()) {
    db.close();
  }
  await db.delete();
  await db.open();
});

describe('reward variants repository', () => {
  it('stores variants in the given order with photos kept apart', async () => {
    await saveVariants(
      'lego',
      [
        { id: null, name: 'Полицейский участок', photo: 'data:image/jpeg;police' },
        { id: null, name: 'Пожарная станция', photo: 'data:image/jpeg;fire' },
      ],
      []
    );

    const variants = await activeOf('lego');
    expect(variants.map((variant) => variant.name)).toEqual(['Полицейский участок', 'Пожарная станция']);
    expect(variants[0]).not.toHaveProperty('photo');
    const photos = await getVariantPhotos(variants.map((variant) => variant.id));
    expect(photos.get(variants[1]!.id)).toBe('data:image/jpeg;fire');
  });

  it('reorders, renames and archives a removed variant instead of deleting it', async () => {
    await saveVariants(
      'lego',
      [
        { id: null, name: 'Участок', photo: '' },
        { id: null, name: 'Станция', photo: '' },
      ],
      []
    );
    const [first, second] = await activeOf('lego');

    await saveVariants('lego', [{ id: second!.id, name: 'Станция 2', photo: '' }], [first!, second!]);

    expect((await activeOf('lego')).map((variant) => variant.name)).toEqual(['Станция 2']);
    const archived = await variantsCatalogue.get(first!.id);
    expect(archived).toMatchObject({ active: false, name: 'Участок' });
    expect(archived?.archivedAt).toBeDefined();
  });

  it('keeps variants of other rewards apart', async () => {
    await saveVariants('lego', [{ id: null, name: 'Участок', photo: '' }], []);
    await saveVariants('book', [{ id: null, name: 'Сказки', photo: '' }], []);

    expect((await activeOf('lego')).map((variant) => variant.name)).toEqual(['Участок']);
  });
});
