import { CHILD_PHOTO_PRESETS } from '../config/constants';

export const childPhotoUrl = (presetId: string): string | undefined => CHILD_PHOTO_PRESETS[presetId];
