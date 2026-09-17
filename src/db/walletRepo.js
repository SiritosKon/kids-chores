import { db } from './db.js';

export async function getChildLedger(childId) {
  const [completions, spends] = await Promise.all([
    db.completions.where('childId').equals(childId).toArray(),
    db.spends.where('childId').equals(childId).toArray(),
  ]);
  return { completions, spends };
}
