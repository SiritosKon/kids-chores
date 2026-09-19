import { liveQuery, type Subscription } from 'dexie';
import { table } from '@/shared/api/db';
import { storedSpendSchema, type Spend } from '../model/schema';

export const spendsTable = table<Spend>('spends');

export const addSpend = async (childId: string, rewardId: string, cost: number): Promise<void> => {
  await spendsTable.add({
    id: crypto.randomUUID(),
    childId,
    rewardId,
    cost,
    createdAt: Date.now(),
    source: 'purchase',
  });
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
