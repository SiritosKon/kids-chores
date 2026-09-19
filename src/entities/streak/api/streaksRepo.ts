import { liveQuery, type Subscription } from 'dexie';
import { table } from '@/shared/api/db';
import { streakStateSchema, type StreakState } from '../model/schema';

export const streaksTable = table<StreakState>('streaks');

export const getStreaks = async (): Promise<StreakState[]> =>
  streakStateSchema.array().parse(await streaksTable.toArray());

export const saveStreaks = async (states: StreakState[]): Promise<void> => {
  await streaksTable.bulkPut(states);
};

export const watchStreaks = (onNext: (states: StreakState[]) => void): Subscription =>
  liveQuery(getStreaks).subscribe({ next: onNext });
