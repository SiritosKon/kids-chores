import { PIN_HASH_BITS, PIN_HASH_ITERATIONS, PIN_SALT_BYTES } from './constants';
import type { PinHash } from '../model/types';

const toBase64 = (bytes: Uint8Array): string => btoa(String.fromCharCode(...bytes));

const fromBase64 = (text: string): Uint8Array<ArrayBuffer> => Uint8Array.from(atob(text), (char) => char.charCodeAt(0));

const newSalt = (): string => toBase64(crypto.getRandomValues(new Uint8Array(PIN_SALT_BYTES)));

export const hashPin = async (pin: string, salt = newSalt(), iterations = PIN_HASH_ITERATIONS): Promise<PinHash> => {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: fromBase64(salt), iterations },
    key,
    PIN_HASH_BITS
  );
  return { salt, hash: toBase64(new Uint8Array(bits)), iterations };
};

export const pinMatches = async (pin: string, stored: PinHash): Promise<boolean> =>
  (await hashPin(pin, stored.salt, stored.iterations)).hash === stored.hash;
