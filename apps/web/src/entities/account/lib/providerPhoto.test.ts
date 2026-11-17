import { describe, expect, it } from 'vitest';
import { providerPhotoUrl } from './providerPhoto';

describe('providerPhotoUrl', () => {
  it('asks Google for a bigger square picture', () => {
    expect(providerPhotoUrl('https://lh3.googleusercontent.com/a/ACg8ocK=s96-c')).toBe(
      'https://lh3.googleusercontent.com/a/ACg8ocK=s256-c'
    );
    expect(providerPhotoUrl('https://lh3.googleusercontent.com/a/ACg8ocK')).toBe(
      'https://lh3.googleusercontent.com/a/ACg8ocK'
    );
  });

  it('refuses links that are not Google profile pictures', () => {
    expect(providerPhotoUrl('https://evil.example/a.png')).toBeNull();
    expect(providerPhotoUrl('http://lh3.googleusercontent.com/a/x')).toBeNull();
    expect(providerPhotoUrl('javascript:alert(1)')).toBeNull();
  });
});
