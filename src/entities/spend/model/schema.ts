import { z } from 'zod';

const timestamp = z.number().int().nonnegative();

export const spendSchema = z.object({
  id: z.string().min(1),
  childId: z.string().min(1),
  rewardId: z.string().min(1),
  // Снимок цены награды на момент выдачи.
  cost: z.number().int(),
  createdAt: timestamp,
});

export type Spend = z.infer<typeof spendSchema>;

// Старые бэкапы могли приехать без таймстемпа — подставляем его при чтении.
export const storedSpendSchema = spendSchema
  .extend({ createdAt: timestamp.optional() })
  .transform((row): Spend => ({ ...row, createdAt: row.createdAt ?? Date.now() }));
