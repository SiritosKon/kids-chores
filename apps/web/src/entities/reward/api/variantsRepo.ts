import { table, transaction } from '@/shared/api/db';
import { createCatalogue } from '@/shared/api/catalogue';
import { rewardVariantSchema, variantPhotoSchema } from '../model/schema';
import type { RewardVariant, VariantPhoto } from '../model/types';
import type { VariantDraft } from './types';

export const variantsCatalogue = createCatalogue<RewardVariant>('rewardVariants', (rows) =>
  rewardVariantSchema.array().parse(rows)
);

export const variantPhotosTable = table<VariantPhoto>('variantPhotos');

export const getVariantPhotos = async (variantIds: readonly string[]): Promise<Map<string, string>> => {
  const rows = variantPhotoSchema
    .array()
    .parse((await variantPhotosTable.bulkGet([...variantIds])).filter((row) => row !== undefined));
  return new Map(rows.map((row) => [row.id, row.photo]));
};

export const getAllVariantPhotos = async (): Promise<VariantPhoto[]> =>
  variantPhotoSchema.array().parse(await variantPhotosTable.toArray());

export const saveVariants = async (
  rewardId: string,
  drafts: readonly VariantDraft[],
  existing: readonly RewardVariant[]
): Promise<void> => {
  const now = Date.now();
  const kept = new Set(drafts.flatMap((draft) => (draft.id ? [draft.id] : [])));
  const photos = await getVariantPhotos(existing.map((variant) => variant.id));

  const rows: RewardVariant[] = [];
  const changedPhotos: VariantPhoto[] = [];

  drafts.forEach((draft, index) => {
    const previous = existing.find((variant) => variant.id === draft.id);
    const id = previous?.id ?? crypto.randomUUID();
    rows.push({
      id,
      rewardId,
      name: draft.name.trim(),
      order: index,
      active: true,
      createdAt: previous?.createdAt ?? now,
      updatedAt: now,
    });
    if (photos.get(id) !== draft.photo) {
      changedPhotos.push({ id, photo: draft.photo });
    }
  });

  const archived = existing
    .filter((variant) => !kept.has(variant.id))
    .map((variant) => ({ ...variant, active: false, archivedAt: now, updatedAt: now }));

  await transaction([variantsCatalogue.table, variantPhotosTable], async () => {
    await variantsCatalogue.putMany([...rows, ...archived]);
    if (changedPhotos.length > 0) {
      await variantPhotosTable.bulkPut(changedPhotos);
    }
  });
};
