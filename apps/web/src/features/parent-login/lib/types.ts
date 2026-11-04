import type { z } from 'zod';
import type { pinLockSchema } from './schema';

export interface ParentCheck {
  question: string;
  answer: number;
}

export interface CheckRange {
  min: number;
  max: number;
}

export type ParentCheckMaker = (random: () => number) => ParentCheck;

export type PinLock = z.infer<typeof pinLockSchema>;
