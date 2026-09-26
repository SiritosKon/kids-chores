import { recalculateStreaks } from '@/features/track-streak';

export const bootstrap = async (): Promise<void> => {
  await recalculateStreaks();
};
