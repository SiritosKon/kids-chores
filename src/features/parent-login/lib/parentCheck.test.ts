import { describe, expect, it } from 'vitest';
import { makeParentCheck } from './parentCheck';

describe('makeParentCheck', () => {
  it('asks to multiply a two-digit number by a single digit', () => {
    expect(makeParentCheck(() => 0)).toEqual({ question: '12 × 3', answer: 36 });
    expect(makeParentCheck(() => 0.999)).toEqual({ question: '19 × 9', answer: 171 });
  });

  it('always gives the right answer to its own question', () => {
    for (let step = 0; step < 100; step += 1) {
      const check = makeParentCheck();
      const [left, right] = check.question.split(' × ').map(Number);
      expect(check.answer).toBe((left ?? 0) * (right ?? 0));
    }
  });
});
