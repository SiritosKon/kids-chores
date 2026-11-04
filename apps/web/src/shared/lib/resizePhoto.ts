import { PHOTO_QUALITY } from './constants';
import type { PhotoFit } from './types';

const drawArea = (width: number, height: number, size: number, fit: PhotoFit) => {
  if (fit === 'square') {
    const side = Math.min(width, height);
    return {
      source: { x: (width - side) / 2, y: (height - side) / 2, width: side, height: side },
      target: { width: size, height: size },
    };
  }
  const scale = Math.min(1, size / Math.max(width, height));
  return {
    source: { x: 0, y: 0, width, height },
    target: { width: Math.round(width * scale), height: Math.round(height * scale) },
  };
};

export const resizePhoto = async (file: Blob, size: number, fit: PhotoFit): Promise<string> => {
  const bitmap = await createImageBitmap(file);
  const { source, target } = drawArea(bitmap.width, bitmap.height, size, fit);
  const canvas = document.createElement('canvas');
  canvas.width = target.width;
  canvas.height = target.height;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('canvas is not available');
  }
  context.drawImage(bitmap, source.x, source.y, source.width, source.height, 0, 0, target.width, target.height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', PHOTO_QUALITY);
};
