import { describe, expect, it } from 'vitest';
import { pluralize } from './plural';

const DAYS = ['день', 'дня', 'дней'] as const;

describe('pluralize', () => {
  it('picks the singular form', () => {
    expect(pluralize(1, DAYS)).toBe('день');
    expect(pluralize(21, DAYS)).toBe('день');
    expect(pluralize(101, DAYS)).toBe('день');
  });

  it('picks the few form', () => {
    expect(pluralize(2, DAYS)).toBe('дня');
    expect(pluralize(4, DAYS)).toBe('дня');
    expect(pluralize(33, DAYS)).toBe('дня');
  });

  it('picks the many form', () => {
    expect(pluralize(5, DAYS)).toBe('дней');
    expect(pluralize(0, DAYS)).toBe('дней');
    expect(pluralize(100, DAYS)).toBe('дней');
  });

  it('handles the teens, where the tail lies', () => {
    expect(pluralize(11, DAYS)).toBe('дней');
    expect(pluralize(12, DAYS)).toBe('дней');
    expect(pluralize(14, DAYS)).toBe('дней');
  });
});
