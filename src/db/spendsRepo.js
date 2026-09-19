import { db } from '@/shared/api/db';

export async function addSpend(childId, rewardId, cost) {
  await db.spends.add({
    id: crypto.randomUUID(),
    childId,
    rewardId,
    cost,
    createdAt: Date.now(),
  });
}

export function getSpends() {
  return db.spends.orderBy('createdAt').reverse().toArray();
}

export async function deleteSpend(id) {
  await db.spends.delete(id);
}
