import type { z } from 'zod';
import type { spendSourceSchema, spendSchema, spendChoiceSchema } from './schema';

export type SpendSource = z.infer<typeof spendSourceSchema>;

export type Spend = z.infer<typeof spendSchema>;

export type SpendChoice = z.infer<typeof spendChoiceSchema>;
