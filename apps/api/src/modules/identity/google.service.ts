import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import type { Redis } from 'ioredis';
import * as oidc from 'openid-client';
import { APP_CONFIG, type AppConfig } from '../../platform/config';
import { VALKEY } from '../../platform/valkey';
import { AUTH_STATE_PREFIX, AUTH_STATE_TTL_SECONDS, GOOGLE_SCOPE, GOOGLE_SERVER } from './constants';
import { callbackUrl } from './lib';
import { authStateSchema } from './schema';
import type { AuthState, ProviderStart } from './types';

@Injectable()
export class GoogleService {
  private readonly client: oidc.Configuration | null;

  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    @Inject(VALKEY) private readonly valkey: Redis
  ) {
    this.client =
      config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET
        ? new oidc.Configuration(GOOGLE_SERVER, config.GOOGLE_CLIENT_ID, config.GOOGLE_CLIENT_SECRET)
        : null;
  }

  async start(): Promise<ProviderStart> {
    const client = this.requireClient();
    const state = oidc.randomState();
    const stored: AuthState = { provider: 'google', verifier: oidc.randomPKCECodeVerifier() };
    await this.valkey.set(`${AUTH_STATE_PREFIX}${state}`, JSON.stringify(stored), 'EX', AUTH_STATE_TTL_SECONDS);
    const url = oidc.buildAuthorizationUrl(client, {
      redirect_uri: callbackUrl(this.config, 'google'),
      scope: GOOGLE_SCOPE,
      code_challenge: await oidc.calculatePKCECodeChallenge(stored.verifier),
      code_challenge_method: 'S256',
      state,
      prompt: 'select_account',
    }).href;
    return { url, state };
  }

  async finish(callback: URL, browserState: string | undefined): Promise<string> {
    const client = this.requireClient();
    const state = callback.searchParams.get('state') ?? '';
    if (!browserState || browserState !== state) {
      throw new UnauthorizedException();
    }
    const raw = await this.valkey.getdel(`${AUTH_STATE_PREFIX}${state}`);
    const stored = authStateSchema.safeParse(JSON.parse(raw ?? 'null'));
    if (!stored.success || stored.data.provider !== 'google') {
      throw new UnauthorizedException();
    }
    const tokens = await oidc.authorizationCodeGrant(client, callback, {
      pkceCodeVerifier: stored.data.verifier,
      expectedState: state,
    });
    const subject = tokens.claims()?.sub;
    if (!subject) {
      throw new UnauthorizedException();
    }
    return subject;
  }

  private requireClient(): oidc.Configuration {
    if (!this.client || !this.config.AUTH_PROVIDERS.includes('google')) {
      throw new NotFoundException();
    }
    return this.client;
  }
}
