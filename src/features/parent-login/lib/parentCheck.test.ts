import { describe, expect, it } from 'vitest';
import { makeParentCheck } from './parentCheck';

const sequence = (...values: number[]): (() => number) => {
  let index = 0;
  return () => {
    const value = values[index % values.length] ?? 0;
    index += 1;
    return value;
  };
};

const apply = (left: number, operator: string, right: number): number => {
  if (operator === '×') {
    return left * right;
  }
  if (operator === '÷') {
    return left / right;
  }
  if (operator === '−') {
    return left - right;
  }
  return left + right;
};

const solve = (question: string): number => {
  const tokens = question.split(' ');
  const [first, operator, second, nextOperator, third] = tokens;
  const head = apply(Number(first), operator ?? '', Number(second));
  return nextOperator === undefined ? head : apply(head, nextOperator, Number(third));
};

describe('makeParentCheck', () => {
  it.each([
    [0, '12 × 3', 36],
    [0.2, '125 + 125', 250],
    [0.4, '400 − 125', 275],
    [0.6, '36 ÷ 3', 12],
    [0.8, '6 × 6 + 11', 47],
  ])('picks the kind by the first random number and starts each range at its bottom (%f)', (kind, question, answer) => {
    expect(makeParentCheck(sequence(kind, 0, 0, 0))).toEqual({ question, answer });
  });

  it.each([
    [0, '19 × 9', 171],
    [0.2, '475 + 475', 950],
    [0.4, '900 − 375', 525],
    [0.6, '171 ÷ 9', 19],
    [0.8, '9 × 9 + 49', 130],
  ])('reaches the top of each range (%f)', (kind, question, answer) => {
    expect(makeParentCheck(sequence(kind, 0.999, 0.999, 0.999))).toEqual({ question, answer });
  });

  it('mixes all five kinds', () => {
    const operators = new Set<string>();
    for (let step = 0; step < 500; step += 1) {
      operators.add(makeParentCheck().question.replace(/\d+/g, 'n'));
    }
    expect([...operators].sort()).toEqual(['n + n', 'n × n', 'n × n + n', 'n ÷ n', 'n − n']);
  });

  it('always gives a positive whole answer to its own question', () => {
    for (let step = 0; step < 500; step += 1) {
      const check = makeParentCheck();
      expect(check.answer).toBe(solve(check.question));
      expect(Number.isInteger(check.answer)).toBe(true);
      expect(check.answer).toBeGreaterThan(0);
    }
  });
});
