import { PHOTO_QUALITY, PHOTO_SIZE } from './constants';

export const resizePhoto = async (file: Blob): Promise<string> => {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = PHOTO_SIZE;
  canvas.height = PHOTO_SIZE;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('canvas is not available');
  }
  context.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    PHOTO_SIZE,
    PHOTO_SIZE
  );
  bitmap.close();
  return canvas.toDataURL('image/jpeg', PHOTO_QUALITY);
};
