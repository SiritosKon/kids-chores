import { describe, expect, it } from 'vitest';
import { isTrustedOrigin } from './lib';

describe('isTrustedOrigin', () => {
  it('lets reading requests through from anywhere', () => {
    expect(isTrustedOrigin('GET', 'https://evil.example', 'http://localhost:8080')).toBe(true);
  });

  it('accepts changes only from the public origin', () => {
    expect(isTrustedOrigin('POST', 'http://localhost:8080', 'http://localhost:8080/')).toBe(true);
    expect(isTrustedOrigin('POST', 'https://evil.example', 'http://localhost:8080')).toBe(false);
    expect(isTrustedOrigin('DELETE', undefined, 'http://localhost:8080')).toBe(false);
  });
});
