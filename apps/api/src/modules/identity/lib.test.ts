import { describe, expect, it } from 'vitest';
import { INVITE_TOKEN_PATTERN } from '@kids-chores/contracts';
import type { AppConfig } from '../../platform/config';
import {
  callbackUrl,
  canonicalContact,
  contactHash,
  failedSignInUrl,
  freshSignIn,
  hashPassword,
  homeUrl,
  inviteTokenHash,
  newInviteToken,
  profileEmail,
  profileName,
  profilePhone,
  providerIdentity,
  profilePicture,
  pwnedCount,
  relyingPartyId,
  sessionCookieOptions,
  sessionKey,
  subjectHash,
  verifyPassword,
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
  TELEGRAM_CLIENT_ID: undefined,
  TELEGRAM_CLIENT_SECRET: undefined,
  WEBAUTHN_RP_ID: undefined,
  SMTP_URL: 'smtp://localhost:1025',
  MAIL_FROM: 'Little Big Deals <no-reply@localhost>',
  S3_ENDPOINT: 'http://localhost:8333',
  S3_REGION: 'us-east-1',
  S3_BUCKET: 'media',
  S3_ACCESS_KEY: 'local',
  S3_SECRET_KEY: 'local-secret',
  EMAIL_SIGN_IN: false,
  PWNED_PASSWORDS_URL: undefined,
  DEV_LOGIN: false,
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

describe('contacts', () => {
  const pepper = 'a-local-pepper-that-is-long-enough';

  it('treats Gmail dots, plus tags and googlemail as one address', () => {
    expect(canonicalContact({ kind: 'email', value: 'j.doe+chores@googlemail.com' })).toBe('jdoe@gmail.com');
    expect(canonicalContact({ kind: 'email', value: 'j.doe+chores@example.com' })).toBe('j.doe+chores@example.com');
    expect(canonicalContact({ kind: 'email', value: ' Mama@Example.COM' })).toBe('mama@example.com');
    expect(contactHash(pepper, { kind: 'email', value: 'j.doe@gmail.com' })).toEqual(
      contactHash(pepper, { kind: 'email', value: 'jdoe@gmail.com' })
    );
  });

  it('keys the hash by kind and pepper', () => {
    const email = contactHash(pepper, { kind: 'email', value: 'a@example.com' });
    expect(email.kind).toBe('email');
    expect(email.hash).toMatch(/^[0-9a-f]{64}$/);
    expect(contactHash('another-pepper-that-is-long-enough', { kind: 'email', value: 'a@example.com' }).hash).not.toBe(email.hash);
  });

  it('makes invite tokens that fit the link and hashes them with the pepper', () => {
    const token = newInviteToken();
    expect(token).toMatch(INVITE_TOKEN_PATTERN);
    expect(newInviteToken()).not.toBe(token);
    expect(inviteTokenHash(pepper, token)).toMatch(/^[0-9a-f]{64}$/);
    expect(inviteTokenHash('another-pepper-that-is-long-enough', token)).not.toBe(inviteTokenHash(pepper, token));
  });

  it('takes the email from Google only when Google verified it', () => {
    expect(profileEmail({ email: 'Mama@Example.com', email_verified: true })).toBe('mama@example.com');
    expect(profileEmail({ email: 'mama@example.com', email_verified: false })).toBeUndefined();
    expect(profileEmail({ email: 'mama@example.com' })).toBeUndefined();
  });
});

describe('provider identity', () => {
  it('takes the phone from Telegram in international format', () => {
    expect(profilePhone({ phone_number: '79991234567', phone_number_verified: true })).toBe('+79991234567');
    expect(profilePhone({ phone_number: '+34 600 123 456' })).toBe('+34600123456');
    expect(profilePhone({ phone_number: '79991234567', phone_number_verified: false })).toBeUndefined();
    expect(profilePhone({ phone_number: '12' })).toBeUndefined();
  });

  it('keeps only the contact each provider verifies', () => {
    const claims = { given_name: 'Аня', email: 'anya@example.com', email_verified: true, phone_number: '79991234567' };
    expect(providerIdentity('google', 'g-1', claims).contacts).toEqual([{ kind: 'email', value: 'anya@example.com' }]);
    expect(providerIdentity('telegram', 't-1', claims)).toEqual({
      subject: 't-1',
      name: 'Аня',
      picture: undefined,
      contacts: [{ kind: 'phone', value: '+79991234567' }],
      linkable: [],
    });
  });

  it('passes on when the provider last asked the person to sign in', () => {
    expect(providerIdentity('google', 'g', { auth_time: 1_800_000_000 }).authTime).toBe(1_800_000_000);
    expect(providerIdentity('telegram', 't', {}).authTime).toBeUndefined();
  });

  it('trusts a confirmation only when the provider asked for a sign-in after the reset began', () => {
    const startedAt = 1_800_000_000;
    expect(freshSignIn(startedAt, startedAt + 20)).toBe(true);
    expect(freshSignIn(startedAt, startedAt - 30)).toBe(true);
    expect(freshSignIn(startedAt, startedAt - 3600)).toBe(false);
    expect(freshSignIn(startedAt, undefined)).toBe(false);
    expect(freshSignIn(undefined, startedAt)).toBe(false);
  });

  it('links to an existing account only by a mailbox Google itself runs', () => {
    const verified = { email_verified: true };
    expect(providerIdentity('google', 'g', { ...verified, email: 'anya@gmail.com' }).linkable).toHaveLength(1);
    expect(providerIdentity('google', 'g', { ...verified, email: 'anya@school.org', hd: 'school.org' }).linkable).toHaveLength(1);
    expect(providerIdentity('google', 'g', { ...verified, email: 'anya@example.com' }).linkable).toEqual([]);
  });
});

describe('passwords', () => {
  it('stores an argon2id hash that only the same password matches', async () => {
    const stored = await hashPassword('correct horse battery');
    expect(stored).toMatch(/^\$argon2id\$v=19\$m=19456,t=2,p=1\$[A-Za-z0-9+/]+\$[A-Za-z0-9+/]+$/);
    expect(stored).not.toContain('correct');
    expect(await hashPassword('correct horse battery')).not.toBe(stored);
    expect(await verifyPassword('correct horse battery', stored)).toBe(true);
    expect(await verifyPassword('correct horse batterY', stored)).toBe(false);
    expect(await verifyPassword('correct horse battery', 'plain text')).toBe(false);
  });

  it('finds a password suffix in a breached-passwords range answer', () => {
    const body = '0018A45C4D1DEF81644B54AB7F969B88D65:1\r\n00D4F6E8FA6EECAD2A3AA415EEC418D38EC:2\r\n011053FD0102E94D6AE2F8B83D76FAF94F6:0';
    expect(pwnedCount(body, '00d4f6e8fa6eecad2a3aa415eec418d38ec')).toBe(2);
    expect(pwnedCount(body, '011053FD0102E94D6AE2F8B83D76FAF94F6')).toBe(0);
    expect(pwnedCount(body, 'FFFF')).toBe(0);
  });
});
