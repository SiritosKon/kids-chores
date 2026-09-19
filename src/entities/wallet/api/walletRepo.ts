import { completionsTable, type Completion } from '@/entities/completion/@x/wallet';
import { spendsTable, type Spend } from '@/entities/spend/@x/wallet';
import { storedCompletionSchema } from '@/entities/completion';
import { storedSpendSchema } from '@/entities/spend';

export interface ChildLedger {
  completions: Completion[];
  spends: Spend[];
}

export async function getChildLedger(childId: string): Promise<ChildLedger> {
  const [completions, spends] = await Promise.all([
    completionsTable.where('childId').equals(childId).toArray(),
    spendsTable.where('childId').equals(childId).toArray(),
  ]);
  return {
    completions: storedCompletionSchema.array().parse(completions),
    spends: storedSpendSchema.array().parse(spends),
  };
}
