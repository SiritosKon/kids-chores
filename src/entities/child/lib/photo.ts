import { CHILD_PHOTO_PRESETS } from '../config/constants';
import { UPLOADED_PHOTO_PREFIX } from './constants';

export const isUploadedPhoto = (photo: string): boolean => photo.startsWith(UPLOADED_PHOTO_PREFIX);

export const childPhotoUrl = (photo: string): string | undefined =>
  isUploadedPhoto(photo) ? photo : CHILD_PHOTO_PRESETS[photo];
