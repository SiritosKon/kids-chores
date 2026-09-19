import timofeyPhoto from '@/shared/assets/timofey.png';
import daniilPhoto from '@/shared/assets/daniil.png';

const PRESETS: Readonly<Record<string, string>> = {
  timofey: timofeyPhoto,
  daniil: daniilPhoto,
};

export const CHILD_PHOTO_PRESET_IDS = Object.keys(PRESETS);

export const childPhotoUrl = (presetId: string): string | undefined => PRESETS[presetId];
