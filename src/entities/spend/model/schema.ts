import { z } from 'zod';

const timestamp = z.number().int().nonnegative();

export const spendSourceSchema = z.enum(['purchase', 'streak']);

export const spendSchema = z.object({
  id: z.string().min(1),
  childId: z.string().min(1),
  rewardId: z.string().min(1),
  cost: z.number().int(),
  createdAt: timestamp,
  source: spendSourceSchema,
});

export type SpendSource = z.infer<typeof spendSourceSchema>;
export type Spend = z.infer<typeof spendSchema>;

export const storedSpendSchema = spendSchema
  .extend({ createdAt: timestamp.optional(), source: spendSourceSchema.optional() })
  .transform(
    (row): Spend => ({
      ...row,
      createdAt: row.createdAt ?? Date.now(),
      source: row.source ?? 'purchase',
    })
  );
