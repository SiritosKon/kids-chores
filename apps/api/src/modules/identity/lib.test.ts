import { describe, expect, it } from 'vitest';
import type { AppConfig } from '../../platform/config';
import {
  callbackUrl,
  emailHash,
  failedSignInUrl,
  homeUrl,
  newPinCode,
  pinCodeHash,
  pinCodeMail,
  profileEmail,
  profileName,
  profilePicture,
  relyingPartyId,
  sameHash,
  sessionCookieOptions,
  sessionKey,
  subjectHash,
} from './lib';

const config = (overrides: Partial<AppConfig> = {}): AppConfig => ({
  NODE_ENV: 'test',
  PORT: 3000,
  TRUST_PROXY_HOPS: 0,
  LOG_LEVEL: 'silent',
  DATABASE_URL: 'postgresql://app_core:secret@localhost:5432/kids_chores',
  VALKEY_URL: 'redis://localhost:6379',
  REGION: 'eu',
  PUBLIC_ORIGIN: 'http://localhost:8080',
  APP_PATH: '/kids-chores/',
  MIN_CLIENT_VERSION: '0.0.0',
  GIT_COMMIT: 'local',
  AUTH_PROVIDERS: [],
  AUTH_PEPPER: 'a-local-pepper-that-is-long-enough',
  GOOGLE_CLIENT_ID: undefined,
  GOOGLE_CLIENT_SECRET: undefined,
  WEBAUTHN_RP_ID: undefined,
  DEV_LOGIN: false,
  SMTP_URL: 'smtp://localhost:1025',
  MAIL_FROM: 'Little Big Deals <no-reply@localhost>',
  APP_VERSION: '0.6.0',
  ...overrides,
});

describe('sessionKey', () => {
  it('keeps only a hash of the token in the key', () => {
    const key = sessionKey('token');
    expect(key).toMatch(/^session:[0-9a-f]{64}$/);
    expect(key).not.toContain('token');
  });
});

describe('subjectHash', () => {
  it('is stable for the same provider and subject and differs between providers', () => {
    const pepper = config().AUTH_PEPPER;
    expect(subjectHash(pepper, 'google', '42')).toBe(subjectHash(pepper, 'google', '42'));
    expect(subjectHash(pepper, 'google', '42')).not.toBe(subjectHash(pepper, 'dev', '42'));
    expect(subjectHash(pepper, 'google', '42')).not.toBe(subjectHash(`${pepper}!`, 'google', '42'));
  });
});

describe('sessionCookieOptions', () => {
  it('is secure only on https', () => {
    expect(sessionCookieOptions(config()).secure).toBe(false);
    expect(sessionCookieOptions(config({ PUBLIC_ORIGIN: 'https://app.example' })).secure).toBe(true);
  });

  it('is sent only to the API and hidden from scripts', () => {
    expect(sessionCookieOptions(config())).toMatchObject({ httpOnly: true, sameSite: 'lax', path: '/v1' });
  });
});

describe('urls', () => {
  it('builds the provider callback and the pages to return to from the public origin', () => {
    const local = config({ PUBLIC_ORIGIN: 'http://localhost:8080/' });
    expect(callbackUrl(local, 'google')).toBe('http://localhost:8080/v1/auth/google/callback');
    expect(homeUrl(local, 'google')).toBe('http://localhost:8080/kids-chores/#/?signedIn=google');
    expect(homeUrl(local, 'google', 'https://lh3.googleusercontent.com/a/x=s96-c')).toBe(
      'http://localhost:8080/kids-chores/#/?signedIn=google&picture=https%3A%2F%2Flh3.googleusercontent.com%2Fa%2Fx%3Ds96-c'
    );
    expect(failedSignInUrl(local, 'google')).toBe('http://localhost:8080/kids-chores/#/?error=google');
  });

  it('takes the passkey domain from the public origin unless it is set', () => {
    expect(relyingPartyId(config())).toBe('localhost');
    expect(relyingPartyId(config({ WEBAUTHN_RP_ID: 'example.app' }))).toBe('example.app');
  });
});

describe('profileName', () => {
  it('takes the first name from the Google profile and falls back to the full name', () => {
    expect(profileName({ sub: '1', given_name: ' Anna ', name: 'Anna Smith' })).toBe('Anna');
    expect(profileName({ sub: '1', name: 'Anna Smith' })).toBe('Anna Smith');
  });

  it('gives nothing when the profile has no usable name', () => {
    expect(profileName({ sub: '1' })).toBeUndefined();
    expect(profileName({ sub: '1', given_name: '   ' })).toBeUndefined();
    expect(profileName({ sub: '1', given_name: 42 })).toBeUndefined();
  });

  it('cuts a long name to the account limit', () => {
    expect(profileName({ sub: '1', given_name: 'x'.repeat(60) })).toHaveLength(40);
  });
});

describe('profilePicture', () => {
  it('passes on a Google profile picture link', () => {
    const picture = 'https://lh3.googleusercontent.com/a/ACg8ocK=s96-c';
    expect(profilePicture({ sub: '1', picture })).toBe(picture);
  });

  it('drops a link that is not an https Google picture', () => {
    expect(profilePicture({ sub: '1' })).toBeUndefined();
    expect(profilePicture({ sub: '1', picture: 'http://lh3.googleusercontent.com/a/x' })).toBeUndefined();
    expect(profilePicture({ sub: '1', picture: 'https://googleusercontent.com.evil.example/a' })).toBeUndefined();
    expect(profilePicture({ sub: '1', picture: 'javascript:alert(1)' })).toBeUndefined();
  });
});

describe('profileEmail', () => {
  it('passes on a verified email', () => {
    expect(profileEmail({ sub: '1', email: 'anna@example.com', email_verified: true })).toBe('anna@example.com');
  });

  it('drops an unverified or broken email', () => {
    expect(profileEmail({ sub: '1', email: 'anna@example.com' })).toBeUndefined();
    expect(profileEmail({ sub: '1', email: 'anna@example.com', email_verified: false })).toBeUndefined();
    expect(profileEmail({ sub: '1', email: 'not an email', email_verified: true })).toBeUndefined();
  });
});

describe('emailHash', () => {
  it('ignores case and spaces around the address', () => {
    const pepper = config().AUTH_PEPPER;
    expect(emailHash(pepper, ' Anna@Example.com ')).toBe(emailHash(pepper, 'anna@example.com'));
    expect(emailHash(pepper, 'anna@example.com')).not.toBe(emailHash(pepper, 'ann@example.com'));
    expect(emailHash(pepper, 'anna@example.com')).not.toContain('anna');
  });
});

describe('sameHash', () => {
  it('compares hex hashes', () => {
    expect(sameHash('ab12', 'ab12')).toBe(true);
    expect(sameHash('ab12', 'ab13')).toBe(false);
    expect(sameHash('ab12', 'ab1234')).toBe(false);
    expect(sameHash('', '')).toBe(false);
  });
});

describe('pin codes', () => {
  it('are six digits, leading zeros included', () => {
    Array.from({ length: 50 }, newPinCode).forEach((code) => expect(code).toMatch(/^\d{6}$/));
  });

  it('hash differently for different accounts', () => {
    const pepper = config().AUTH_PEPPER;
    expect(pinCodeHash(pepper, 'a', '123456')).not.toBe(pinCodeHash(pepper, 'b', '123456'));
    expect(pinCodeHash(pepper, 'a', '123456')).not.toContain('123456');
  });

  it('go out in the language of the app', () => {
    expect(pinCodeMail('ru', '012345')).toEqual({
      subject: 'Little Big Deals: код для смены PIN',
      text: expect.stringContaining('PIN в Little Big Deals: 012345\n\nОн действует 10 минут.'),
    });
    expect(pinCodeMail('en', '012345').text).toContain('012345');
    expect(pinCodeMail('es', '012345').text).toContain('10 minutos');
  });
});
