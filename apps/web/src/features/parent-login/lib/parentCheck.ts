import {
  CHECK_ADDEND_RANGE,
  CHECK_DIGIT_RANGE,
  CHECK_FACTOR_RANGE,
  CHECK_MINUEND_RANGE,
  CHECK_MULTIPLIER_RANGE,
  CHECK_SUBTRAHEND_RANGE,
  CHECK_TERM_RANGE,
} from './constants';
import type { CheckRange, ParentCheck, ParentCheckMaker } from './types';

const between = (range: CheckRange, random: () => number): number =>
  range.min + Math.floor(random() * (range.max - range.min + 1));

export const makeProduct: ParentCheckMaker = (random) => {
  const factor = between(CHECK_FACTOR_RANGE, random);
  const multiplier = between(CHECK_MULTIPLIER_RANGE, random);
  return { question: `${factor} × ${multiplier}`, answer: factor * multiplier };
};

export const makeSum: ParentCheckMaker = (random) => {
  const first = between(CHECK_ADDEND_RANGE, random);
  const second = between(CHECK_ADDEND_RANGE, random);
  return { question: `${first} + ${second}`, answer: first + second };
};

export const makeDifference: ParentCheckMaker = (random) => {
  const minuend = between(CHECK_MINUEND_RANGE, random);
  const subtrahend = between(CHECK_SUBTRAHEND_RANGE, random);
  return { question: `${minuend} − ${subtrahend}`, answer: minuend - subtrahend };
};

export const makeQuotient: ParentCheckMaker = (random) => {
  const quotient = between(CHECK_FACTOR_RANGE, random);
  const divisor = between(CHECK_MULTIPLIER_RANGE, random);
  return { question: `${quotient * divisor} ÷ ${divisor}`, answer: quotient };
};

export const makeTwoSteps: ParentCheckMaker = (random) => {
  const first = between(CHECK_DIGIT_RANGE, random);
  const second = between(CHECK_DIGIT_RANGE, random);
  const term = between(CHECK_TERM_RANGE, random);
  return { question: `${first} × ${second} + ${term}`, answer: first * second + term };
};

export const makeParentCheck = (random: () => number = Math.random): ParentCheck => {
  const makers = [makeProduct, makeSum, makeDifference, makeQuotient, makeTwoSteps];
  const maker = makers[Math.floor(random() * makers.length)] ?? makeProduct;
  return maker(random);
};
