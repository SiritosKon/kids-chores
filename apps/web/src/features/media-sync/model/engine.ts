import { childrenCatalogue, isUploadedPhoto } from '@/entities/child';
import { variantPhotosTable, variantsCatalogue } from '@/entities/reward';
import { deleteMedia, downloadMedia, uploadMedia } from '../api/mediaApi';
import { blobToDataUrl, dataUrlToBlob } from '../lib/dataUrl';
import { photoAction } from '../lib/photoAction';
import type { PhotoSlot, SlotStore } from './types';

const syncSlot = async (slot: PhotoSlot, store: SlotStore): Promise<boolean> => {
  const action = photoAction(slot);
  if (action === 'upload') {
    const id = await uploadMedia(dataUrlToBlob(slot.photo));
    if (id === null) {
      return false;
    }
    if ((await store.currentPhoto()) !== slot.photo) {
      await deleteMedia(id);
      return false;
    }
    await store.share(id);
    await store.keep({ photoSyncedId: id, photoPending: false });
    if (slot.photoId !== undefined) {
      await deleteMedia(slot.photoId);
    }
    return false;
  }
  if (action === 'clear') {
    if (slot.photoId !== undefined) {
      await store.share(undefined);
      await deleteMedia(slot.photoId);
    }
    await store.keep({ photoSyncedId: undefined, photoPending: false });
    return false;
  }
  if (action === 'download' && slot.photoId !== undefined) {
    const download = await downloadMedia(slot.photoId);
    if (download.status === 'ok') {
      await store.keep({ photo: await blobToDataUrl(download.blob), photoSyncedId: slot.photoId });
      return true;
    }
    if (download.status === 'gone') {
      await store.keep(isUploadedPhoto(slot.photo) ? { photoPending: true } : { photoSyncedId: slot.photoId });
    }
    return false;
  }
  if (action === 'drop') {
    await store.keep({ photo: '', photoSyncedId: undefined });
    return true;
  }
  return false;
};

export const syncPhotos = async (): Promise<boolean> => {
  let changed = false;
  for (const child of await childrenCatalogue.read()) {
    const store: SlotStore = {
      currentPhoto: async () => (await childrenCatalogue.get(child.id))?.photo,
      share: (photoId) => childrenCatalogue.update(child.id, { photoId }),
      keep: async (patch) => {
        await childrenCatalogue.table.update(child.id, patch);
      },
    };
    changed = (await syncSlot(child, store)) || changed;
  }
  for (const variant of await variantsCatalogue.read()) {
    const row = (await variantPhotosTable.get(variant.id)) ?? { id: variant.id, photo: '' };
    const store: SlotStore = {
      currentPhoto: async () => (await variantPhotosTable.get(variant.id))?.photo ?? '',
      share: (photoId) => variantsCatalogue.update(variant.id, { photoId }),
      keep: async (patch) => {
        const current = (await variantPhotosTable.get(variant.id)) ?? row;
        await variantPhotosTable.put({ ...current, ...patch });
      },
    };
    const slot: PhotoSlot = {
      photo: row.photo,
      photoId: variant.photoId,
      photoSyncedId: row.photoSyncedId,
      photoPending: row.photoPending,
    };
    changed = (await syncSlot(slot, store)) || changed;
  }
  return changed;
};
