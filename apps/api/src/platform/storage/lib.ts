import { FAMILY_MEDIA_PREFIX } from './constants';

export const familyMediaPrefix = (familyId: string): string => `${FAMILY_MEDIA_PREFIX}${familyId}/`;

export const mediaKey = (familyId: string, mediaId: string): string => `${familyMediaPrefix(familyId)}${mediaId}.jpg`;
