import { describe, expect, it } from 'vitest';
import { hashSecret, normalizeAnswer, secretMatches } from './secretHash';

describe('hashSecret', () => {
  it('keeps no trace of the secret and salts every hash', async () => {
    const first = await hashSecret('123456', undefined, 1000);
    const second = await hashSecret('123456', undefined, 1000);

    expect(JSON.stringify(first)).not.toContain('123456');
    expect(first.salt).not.toBe(second.salt);
    expect(first.hash).not.toBe(second.hash);
  });

  it('accepts only the secret it was made from', async () => {
    const stored = await hashSecret('123456', undefined, 1000);

    expect(await secretMatches('123456', stored)).toBe(true);
    expect(await secretMatches('654321', stored)).toBe(false);
  });
});

describe('normalizeAnswer', () => {
  it('ignores case, ё and extra spaces', () => {
    expect(normalizeAnswer('  Ёлка   в  Сочи ')).toBe('елка в сочи');
  });
});
