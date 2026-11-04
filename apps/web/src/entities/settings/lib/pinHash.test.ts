import { describe, expect, it } from 'vitest';
import { hashPin, pinMatches } from './pinHash';

describe('hashPin', () => {
  it('keeps no trace of the pin and salts every hash', async () => {
    const first = await hashPin('123456', undefined, 1000);
    const second = await hashPin('123456', undefined, 1000);

    expect(JSON.stringify(first)).not.toContain('123456');
    expect(first.salt).not.toBe(second.salt);
    expect(first.hash).not.toBe(second.hash);
  });

  it('accepts only the pin it was made from', async () => {
    const stored = await hashPin('123456', undefined, 1000);

    expect(await pinMatches('123456', stored)).toBe(true);
    expect(await pinMatches('654321', stored)).toBe(false);
  });
});
