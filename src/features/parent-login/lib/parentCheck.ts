import { CHECK_FACTOR_RANGE, CHECK_MULTIPLIER_RANGE } from './constants';
import type { ParentCheck } from './types';

const between = (range: { min: number; max: number }, random: () => number): number =>
  range.min + Math.floor(random() * (range.max - range.min + 1));

export const makeParentCheck = (random: () => number = Math.random): ParentCheck => {
  const factor = between(CHECK_FACTOR_RANGE, random);
  const multiplier = between(CHECK_MULTIPLIER_RANGE, random);
  return { question: `${factor} × ${multiplier}`, answer: factor * multiplier };
};
