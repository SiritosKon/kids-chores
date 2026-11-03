import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkPinCode, requestPinCode } from './pinCodes';

const answer = (status: number): void => {
  vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response(null, { status }))));
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('requestPinCode', () => {
  it('sends the email and the language of the app', async () => {
    answer(204);
    expect(await requestPinCode('anna@example.com', 'es')).toBe('ok');
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      '/v1/pin/code',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ email: 'anna@example.com', locale: 'es' }) })
    );
  });

  it('tells a wrong email from an account the server has no email for', async () => {
    answer(422);
    expect(await requestPinCode('anna@example.com', 'ru')).toBe('wrong');
    answer(409);
    expect(await requestPinCode('anna@example.com', 'ru')).toBe('noEmail');
    answer(429);
    expect(await requestPinCode('anna@example.com', 'ru')).toBe('tooSoon');
    answer(503);
    expect(await requestPinCode('anna@example.com', 'ru')).toBe('failed');
  });

  it('knows when there is no connection', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new TypeError('offline'))));
    expect(await requestPinCode('anna@example.com', 'ru')).toBe('offline');
  });
});

describe('checkPinCode', () => {
  it('tells a wrong code from a code that is gone', async () => {
    answer(204);
    expect(await checkPinCode('012345')).toBe('ok');
    answer(422);
    expect(await checkPinCode('012345')).toBe('wrong');
    answer(410);
    expect(await checkPinCode('012345')).toBe('expired');
  });
});
