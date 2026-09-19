import { createCatalogue } from '@/shared/api/catalogue';
import { childSchema, type Child } from '../model/schema';

export const childrenCatalogue = createCatalogue<Child>('children', (rows) =>
  childSchema.array().parse(rows)
);
