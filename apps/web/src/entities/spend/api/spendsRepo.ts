import { liveQuery, type Subscription } from 'dexie';
import { table } from '@/shared/api/db';
import { storedSpendSchema } from '../model/schema';
import type { Spend, SpendChoice } from '../model/types';

export const spendsTable = table<Spend>('spends');

export const addSpend = async (
  childId: string,
  rewardId: string,
  cost: number,
  choice: SpendChoice | null = null
): Promise<void> => {
  const now = Date.now();
  await spendsTable.add({
    id: crypto.randomUUID(),
    childId,
    rewardId,
    cost,
    createdAt: now,
    source: 'purchase',
    ...(choice ? { ...choice, chosenAt: now } : {}),
  });
};

export const chooseSpendVariant = async (spendId: string, choice: SpendChoice): Promise<void> => {
  await spendsTable.update(spendId, { ...choice, chosenAt: Date.now() });
};

export const getSpends = async (): Promise<Spend[]> => {
  return storedSpendSchema.array().parse(await spendsTable.orderBy('createdAt').reverse().toArray());
};

export const getAllSpends = async (): Promise<Spend[]> => {
  return storedSpendSchema.array().parse(await spendsTable.toArray());
};

export const deleteSpend = async (id: string): Promise<void> => {
  await spendsTable.delete(id);
};

export const watchSpends = (onNext: (spends: Spend[]) => void): Subscription => {
  return liveQuery(() => getSpends()).subscribe({ next: onNext });
};
