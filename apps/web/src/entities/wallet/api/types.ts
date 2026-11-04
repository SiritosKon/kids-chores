import type { Completion } from '@/entities/completion/@x/wallet';
import type { Spend } from '@/entities/spend/@x/wallet';

export interface ChildLedger {
  completions: Completion[];
  spends: Spend[];
}
