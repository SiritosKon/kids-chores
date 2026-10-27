import { randomUUID } from 'node:crypto';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { meResponseSchema, metaResponseSchema, SESSION_COOKIE } from '@kids-chores/contracts';
import { APP_CONFIG, type AppConfig } from '../../platform/config';
import { cookieHeader, createTestApp } from '../../testing';

describe('identity over HTTP', () => {
  let app: NestFastifyApplication;
  let origin: string;

  beforeAll(async () => {
    app = await createTestApp();
    origin = new URL(app.get<AppConfig>(APP_CONFIG).PUBLIC_ORIGIN).origin;
  });

  afterAll(async () => {
    await app.close();
  });

  const devLogin = async (name: string): Promise<string> => {
    const response = await app.inject({ method: 'POST', url: '/v1/dev/login', headers: { origin }, payload: { name } });
    expect(response.statusCode).toBe(204);
    return cookieHeader(response);
  };

  const me = async (cookie: string): Promise<{ status: number; body: unknown }> => {
    const response = await app.inject({ method: 'GET', url: '/v1/me', headers: { cookie } });
    return { status: response.statusCode, body: response.statusCode === 200 ? response.json() : null };
  };

  it('tells the app which sign-in methods are on', async () => {
    const response = await app.inject({ method: 'GET', url: '/v1/meta' });
    expect(metaResponseSchema.parse(response.json()).auth).toEqual({ providers: ['google'], devLogin: true });
  });

  it('closes the API without a session', async () => {
    expect((await me('')).status).toBe(401);
    expect((await me(`${SESSION_COOKIE}=forged`)).status).toBe(401);
  });

  it('refuses changes from another origin', async () => {
    const foreign = await app.inject({
      method: 'POST',
      url: '/v1/dev/login',
      headers: { origin: 'https://evil.example' },
      payload: { name: 'mallory' },
    });
    expect(foreign.statusCode).toBe(403);
    const missing = await app.inject({ method: 'POST', url: '/v1/dev/login', payload: { name: 'mallory' } });
    expect(missing.statusCode).toBe(403);
  });

  it('rejects an empty dev name', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/dev/login',
      headers: { origin },
      payload: { name: '  ' },
    });
    expect(response.statusCode).toBe(400);
  });

  it('puts the session into an httpOnly cookie for the API only', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/dev/login',
      headers: { origin },
      payload: { name: `cookie-${randomUUID().slice(0, 8)}` },
    });
    expect(response.cookies).toEqual([
      expect.objectContaining({ name: SESSION_COOKIE, httpOnly: true, path: '/v1', sameSite: 'Lax' }),
    ]);
  });

  it('brings the same name back to the same family on a new device', async () => {
    const name = `parent-${randomUUID().slice(0, 8)}`;
    const first = meResponseSchema.parse((await me(await devLogin(name))).body);
    const second = meResponseSchema.parse((await me(await devLogin(name))).body);
    const stranger = meResponseSchema.parse((await me(await devLogin(`other-${randomUUID().slice(0, 8)}`))).body);

    expect(second.familyId).toBe(first.familyId);
    expect(second.userId).toBe(first.userId);
    expect(second.deviceId).not.toBe(first.deviceId);
    expect(stranger.familyId).not.toBe(first.familyId);
    expect(first.hasPasskey).toBe(false);
  });

  it('ends the session on logout', async () => {
    const cookie = await devLogin(`logout-${randomUUID().slice(0, 8)}`);
    expect((await me(cookie)).status).toBe(200);
    const response = await app.inject({ method: 'POST', url: '/v1/auth/logout', headers: { origin, cookie } });
    expect(response.statusCode).toBe(204);
    expect((await me(cookie)).status).toBe(401);
  });

  it('sends the parent to Google with PKCE and a state', async () => {
    const response = await app.inject({ method: 'GET', url: '/v1/auth/google/start' });
    expect(response.statusCode).toBe(302);
    const location = new URL(response.headers.location ?? '');
    expect(location.origin).toBe('https://accounts.google.com');
    expect(location.searchParams.get('client_id')).toBe('integration-client');
    expect(location.searchParams.get('redirect_uri')).toBe(`${origin}/v1/auth/google/callback`);
    expect(location.searchParams.get('scope')).toBe('openid email');
    expect(location.searchParams.get('code_challenge_method')).toBe('S256');
    expect(location.searchParams.get('state')).toBeTruthy();
    expect(response.cookies).toEqual([
      expect.objectContaining({
        name: 'lbd_auth_state',
        value: location.searchParams.get('state'),
        httpOnly: true,
        path: '/v1/auth',
      }),
    ]);
  });

  it('refuses a callback that this browser did not start', async () => {
    const started = await app.inject({ method: 'GET', url: '/v1/auth/google/start' });
    const state = new URL(started.headers.location ?? '').searchParams.get('state') ?? '';
    const response = await app.inject({
      method: 'GET',
      url: `/v1/auth/google/callback?code=x&state=${state}`,
      headers: { cookie: 'lbd_auth_state=attacker-state' },
    });
    expect(response.headers.location).toBe(`${origin}/kids-chores/#/account?error=google`);
    expect(response.cookies.filter((cookie) => cookie.name === 'lbd_session')).toEqual([]);
  });

  it('returns to the account page with an error when the state is unknown', async () => {
    const response = await app.inject({ method: 'GET', url: '/v1/auth/google/callback?code=x&state=unknown' });
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe(`${origin}/kids-chores/#/account?error=google`);
    expect(response.cookies.filter((cookie) => cookie.name === 'lbd_session')).toEqual([]);
  });

  it('does not know providers that are off', async () => {
    const response = await app.inject({ method: 'GET', url: '/v1/auth/apple/start' });
    expect(response.statusCode).toBe(404);
  });

  it('offers passkey creation only to a signed-in parent', async () => {
    const anonymous = await app.inject({
      method: 'POST',
      url: '/v1/auth/passkey/register/options',
      headers: { origin },
    });
    expect(anonymous.statusCode).toBe(401);

    const cookie = await devLogin(`passkey-${randomUUID().slice(0, 8)}`);
    const response = await app.inject({
      method: 'POST',
      url: '/v1/auth/passkey/register/options',
      headers: { origin, cookie },
    });
    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      rp: { id: new URL(origin).hostname, name: 'Little Big Deals' },
      user: { name: 'Little Big Deals' },
      authenticatorSelection: { residentKey: 'required', userVerification: 'required' },
    });
  });

  it('refuses a passkey it has never seen', async () => {
    const options = await app.inject({ method: 'POST', url: '/v1/auth/passkey/login/options', headers: { origin } });
    expect(options.statusCode).toBe(201);
    const { flowId } = options.json<{ flowId: string }>();
    const response = await app.inject({
      method: 'POST',
      url: '/v1/auth/passkey/login',
      headers: { origin },
      payload: {
        flowId,
        response: {
          id: 'unknown',
          rawId: 'unknown',
          type: 'public-key',
          clientExtensionResults: {},
          response: { clientDataJSON: 'e30', authenticatorData: 'AA', signature: 'AA' },
        },
      },
    });
    expect(response.statusCode).toBe(401);
  });
});
