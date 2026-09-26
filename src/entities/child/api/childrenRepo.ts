import { createCatalogue } from '@/shared/api/catalogue';
import { childSchema } from '../model/schema';
import type { Child } from '../model/types';

export const childrenCatalogue = createCatalogue<Child>('children', (rows) =>
  childSchema.array().parse(rows)
);
