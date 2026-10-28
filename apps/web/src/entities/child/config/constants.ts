import timofeyPhoto from '@/shared/assets/timofey.png';
import daniilPhoto from '@/shared/assets/daniil.png';

export const CHILD_PHOTO_PRESETS: Readonly<Record<string, string>> = {
  timofey: timofeyPhoto,
  daniil: daniilPhoto,
};

export const CHILD_PHOTO_PRESET_IDS = Object.keys(CHILD_PHOTO_PRESETS);
