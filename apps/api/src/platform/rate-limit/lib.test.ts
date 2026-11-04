import { describe, expect, it } from 'vitest';
import { ipSubject, rateLimitChecks, rateLimitKey } from './lib';

describe('ipSubject', () => {
  it('keeps an IPv4 address as it is', () => {
    expect(ipSubject('203.0.113.5')).toBe('203.0.113.5');
  });

  it('unwraps an IPv4 address mapped into IPv6', () => {
    expect(ipSubject('::ffff:203.0.113.5')).toBe('203.0.113.5');
  });

  it('groups IPv6 addresses by their /64 network', () => {
    expect(ipSubject('2001:db8:1:2:aaaa::1')).toBe('2001:db8:1:2::/64');
    expect(ipSubject('2001:0db8:0001:0002:bbbb:cccc:dddd:eeee')).toBe('2001:db8:1:2::/64');
    expect(ipSubject('2001:db8::1')).toBe('2001:db8:0:0::/64');
    expect(ipSubject('::1')).toBe('0:0:0:0::/64');
  });
});

describe('rateLimitChecks', () => {
  it('counts every request against its address', () => {
    expect(rateLimitChecks('203.0.113.5', undefined, false)).toEqual([{ bucket: 'ip', subject: '203.0.113.5' }]);
  });

  it('adds the sign-in counter and the session counter when they apply', () => {
    expect(rateLimitChecks('203.0.113.5', 'token', true)).toEqual([
      { bucket: 'ip', subject: '203.0.113.5' },
      { bucket: 'auth', subject: '203.0.113.5' },
      { bucket: 'session', subject: 'token' },
    ]);
  });
});

describe('rateLimitKey', () => {
  it('keeps neither the address nor the token in the key', () => {
    const key = rateLimitKey('secret', 'ip', '203.0.113.5');
    expect(key.startsWith('rate:ip:')).toBe(true);
    expect(key).not.toContain('203.0.113.5');
    expect(rateLimitKey('secret', 'ip', '203.0.113.5')).toBe(key);
    expect(rateLimitKey('other', 'ip', '203.0.113.5')).not.toBe(key);
  });
});
