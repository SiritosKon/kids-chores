import { liveQuery, type Subscription } from 'dexie';
import { table } from '@/shared/api/db';
import { storedSpendSchema, type Spend } from '../model/schema';

export const spendsTable = table<Spend>('spends');

export async function addSpend(childId: string, rewardId: string, cost: number): Promise<void> {
  await spendsTable.add({ id: crypto.randomUUID(), childId, rewardId, cost, createdAt: Date.now() });
}

export async function getSpends(): Promise<Spend[]> {
  return storedSpendSchema.array().parse(await spendsTable.orderBy('createdAt').reverse().toArray());
}

export async function getAllSpends(): Promise<Spend[]> {
  return storedSpendSchema.array().parse(await spendsTable.toArray());
}

export async function deleteSpend(id: string): Promise<void> {
  await spendsTable.delete(id);
}

// Живой список списаний: Dexie сам пересчитает подписку после любой записи.
export function watchSpends(onNext: (spends: Spend[]) => void): Subscription {
  return liveQuery(() => getSpends()).subscribe({ next: onNext });
}
