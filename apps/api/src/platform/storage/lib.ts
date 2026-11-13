import { FAMILY_MEDIA_PREFIX, MEDIA_KEY_PATTERN } from './constants';
import type { MediaLocation } from './types';

export const familyMediaPrefix = (familyId: string): string => `${FAMILY_MEDIA_PREFIX}${familyId}/`;

export const mediaKey = (familyId: string, mediaId: string): string => `${familyMediaPrefix(familyId)}${mediaId}.jpg`;

export const mediaLocation = (key: string): MediaLocation | null => {
  const [, familyId, mediaId] = MEDIA_KEY_PATTERN.exec(key) ?? [];
  return familyId && mediaId ? { familyId, mediaId } : null;
};
