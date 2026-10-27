import { providerPictureSchema } from '@kids-chores/contracts';
import { resizePhoto } from '@/shared/lib/resizePhoto';
import { PROVIDER_PHOTO_SIZE, PROVIDER_PHOTO_SIZE_SUFFIX } from './constants';

export const providerPhotoUrl = (url: string): string | null => {
  const parsed = providerPictureSchema.safeParse(url);
  return parsed.success ? parsed.data.replace(PROVIDER_PHOTO_SIZE_SUFFIX, `=s${PROVIDER_PHOTO_SIZE}-c`) : null;
};

export const downloadProviderPhoto = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url, { credentials: 'omit', referrerPolicy: 'no-referrer' });
    return response.ok ? await resizePhoto(await response.blob(), PROVIDER_PHOTO_SIZE, 'square') : url;
  } catch {
    return url;
  }
};
