import { SECRET_HASH_BITS, SECRET_HASH_ITERATIONS, SECRET_SALT_BYTES } from './constants';
import type { SecretHash } from '../model/types';

const toBase64 = (bytes: Uint8Array): string => btoa(String.fromCharCode(...bytes));

const fromBase64 = (text: string): Uint8Array<ArrayBuffer> => Uint8Array.from(atob(text), (char) => char.charCodeAt(0));

const newSalt = (): string => toBase64(crypto.getRandomValues(new Uint8Array(SECRET_SALT_BYTES)));

export const hashSecret = async (
  secret: string,
  salt = newSalt(),
  iterations = SECRET_HASH_ITERATIONS
): Promise<SecretHash> => {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: fromBase64(salt), iterations },
    key,
    SECRET_HASH_BITS
  );
  return { salt, hash: toBase64(new Uint8Array(bits)), iterations };
};

export const secretMatches = async (secret: string, stored: SecretHash): Promise<boolean> =>
  (await hashSecret(secret, stored.salt, stored.iterations)).hash === stored.hash;
