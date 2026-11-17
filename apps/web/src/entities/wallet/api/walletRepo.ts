import { completionsTable } from '@/entities/completion/@x/wallet';
import { spendsTable } from '@/entities/spend/@x/wallet';
import { storedCompletionSchema } from '@/entities/completion';
import { storedSpendSchema } from '@/entities/spend';
import type { ChildLedger } from './types';

export const getChildLedger = async (childId: string): Promise<ChildLedger> => {
  const [completions, spends] = await Promise.all([
    completionsTable.where('childId').equals(childId).toArray(),
    spendsTable.where('childId').equals(childId).toArray(),
  ]);
  return {
    completions: storedCompletionSchema.array().parse(completions),
    spends: storedSpendSchema.array().parse(spends),
  };
};
