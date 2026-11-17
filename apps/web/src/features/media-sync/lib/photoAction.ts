import { isUploadedPhoto } from '@/entities/child';
import type { PhotoAction, PhotoSlot } from '../model/types';

export const photoAction = (slot: PhotoSlot): PhotoAction => {
  const uploaded = isUploadedPhoto(slot.photo);
  const legacy = uploaded && slot.photoId === undefined && slot.photoSyncedId === undefined;
  if (slot.photoPending === true || legacy) {
    return uploaded ? 'upload' : 'clear';
  }
  if (slot.photoId !== undefined && slot.photoSyncedId !== slot.photoId) {
    return 'download';
  }
  if (slot.photoId === undefined && slot.photoSyncedId !== undefined) {
    return 'drop';
  }
  return 'none';
};
