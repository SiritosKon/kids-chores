import { describe, expect, it } from 'vitest';
import { contactSchema, meResponseSchema } from './schema.js';

describe('contactSchema', () => {
  it('normalizes an email to lower case', () => {
    expect(contactSchema.parse({ kind: 'email', value: ' Mama@Example.COM ' })).toEqual({
      kind: 'email',
      value: 'mama@example.com',
    });
  });

  it('keeps only the digits of a phone in international format', () => {
    expect(contactSchema.parse({ kind: 'phone', value: '+7 (999) 123-45-67' }).value).toBe('+79991234567');
    expect(contactSchema.parse({ kind: 'phone', value: '0034 600 123 456' }).value).toBe('+34600123456');
  });

  it('refuses a phone without a country code', () => {
    expect(contactSchema.safeParse({ kind: 'phone', value: '8 999 123 45 67' }).success).toBe(false);
    expect(contactSchema.safeParse({ kind: 'phone', value: '+7 12' }).success).toBe(false);
  });
});

describe('meResponseSchema', () => {
  it('reads an account remembered before families had several parents', () => {
    const me = meResponseSchema.parse({
      userId: '5b0d1f0e-7d2f-4b8e-9a37-1b2c3d4e5f60',
      familyId: '6c1e2a1f-8e3a-4c9f-8b48-2c3d4e5f6a71',
      deviceId: '7d2f3b2a-9f4b-4d0a-9c59-3d4e5f6a7b82',
      name: 'Мама',
      hasPasskey: false,
    });
    expect(me).toMatchObject({ role: 'owner', members: 1, invites: [], joinRequests: 0 });
  });
});
