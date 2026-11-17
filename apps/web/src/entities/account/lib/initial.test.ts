import { describe, expect, it } from 'vitest';
import { nameInitial } from './initial';

describe('nameInitial', () => {
  it('takes the first letter of the name in upper case', () => {
    expect(nameInitial(' анна')).toBe('А');
    expect(nameInitial('mom')).toBe('M');
  });

  it('keeps an emoji whole', () => {
    expect(nameInitial('🦊 Fox')).toBe('🦊');
  });
});
