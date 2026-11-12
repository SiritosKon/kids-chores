import { MEDIA_MAX_BYTES } from '@kids-chores/contracts';
import { JPEG_MAGIC } from './constants';

export const isJpeg = (body: unknown): body is Buffer =>
  Buffer.isBuffer(body) && body.length > JPEG_MAGIC.length && body.length <= MEDIA_MAX_BYTES && body.subarray(0, 3).equals(JPEG_MAGIC);
