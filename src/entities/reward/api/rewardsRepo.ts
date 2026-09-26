import { createCatalogue } from '@/shared/api/catalogue';
import { rewardSchema } from '../model/schema';
import type { Reward } from '../model/types';

export const rewardsCatalogue = createCatalogue<Reward>('rewards', (rows) =>
  rewardSchema.array().parse(rows)
);
