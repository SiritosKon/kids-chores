import { createCatalogue } from '@/shared/api/catalogue';
import { rewardSchema, type Reward } from '../model/schema';

export const rewardsCatalogue = createCatalogue<Reward>('rewards', (rows) =>
  rewardSchema.array().parse(rows)
);
