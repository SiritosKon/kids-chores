import { describe, expect, it } from 'vitest';
import { isTrustedOrigin, trustedHops } from './lib';

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

describe('trustedHops', () => {
  it('trusts no proxy by default', () => {
    expect(trustedHops(0)).toBe(false);
  });

  it('trusts exactly the given number of proxies in front of the api', () => {
    const trust = trustedHops(1);
    expect(typeof trust === 'function' && trust('10.0.0.2', 0)).toBe(true);
    expect(typeof trust === 'function' && trust('203.0.113.5', 1)).toBe(false);
  });
});
