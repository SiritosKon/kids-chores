import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import type { Redis } from 'ioredis';
import * as oidc from 'openid-client';
import type { AuthProvider } from '@kids-chores/contracts';
import { APP_CONFIG, type AppConfig } from '../../platform/config';
import { VALKEY } from '../../platform/valkey';
import { AUTH_STATE_PREFIX, AUTH_STATE_TTL_SECONDS, OIDC_PROVIDERS } from './constants';
import { callbackUrl, providerCredentials, providerIdentity } from './lib';
import { authStateSchema } from './schema';
import type { AuthState, ProviderIdentity, ProviderStart } from './types';

@Injectable()
export class OidcService {
  private readonly clients = new Map<AuthProvider, oidc.Configuration>();

  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    @Inject(VALKEY) private readonly valkey: Redis
  ) {
    for (const provider of config.AUTH_PROVIDERS) {
      const credentials = providerCredentials(config, provider);
      if (credentials) {
        this.clients.set(
          provider,
          new oidc.Configuration(OIDC_PROVIDERS[provider].server, credentials.clientId, credentials.clientSecret)
        );
      }
    }
  }

  async start(provider: AuthProvider): Promise<ProviderStart> {
    const client = this.requireClient(provider);
    const state = oidc.randomState();
    const stored: AuthState = { provider, verifier: oidc.randomPKCECodeVerifier() };
    await this.valkey.set(`${AUTH_STATE_PREFIX}${state}`, JSON.stringify(stored), 'EX', AUTH_STATE_TTL_SECONDS);
    const url = oidc.buildAuthorizationUrl(client, {
      ...OIDC_PROVIDERS[provider].params,
      redirect_uri: callbackUrl(this.config, provider),
      scope: OIDC_PROVIDERS[provider].scope,
      code_challenge: await oidc.calculatePKCECodeChallenge(stored.verifier),
      code_challenge_method: 'S256',
      state,
    }).href;
    return { url, state };
  }

  async finish(provider: AuthProvider, callback: URL, browserState: string | undefined): Promise<ProviderIdentity> {
    const client = this.requireClient(provider);
    const state = callback.searchParams.get('state') ?? '';
    if (!browserState || browserState !== state) {
      throw new UnauthorizedException();
    }
    const raw = await this.valkey.getdel(`${AUTH_STATE_PREFIX}${state}`);
    const stored = authStateSchema.safeParse(JSON.parse(raw ?? 'null'));
    if (!stored.success || stored.data.provider !== provider) {
      throw new UnauthorizedException();
    }
    const tokens = await oidc.authorizationCodeGrant(client, callback, {
      pkceCodeVerifier: stored.data.verifier,
      expectedState: state,
    });
    const claims = tokens.claims();
    if (!claims?.sub) {
      throw new UnauthorizedException();
    }
    return providerIdentity(provider, claims.sub, claims);
  }

  private requireClient(provider: AuthProvider): oidc.Configuration {
    const client = this.clients.get(provider);
    if (!client) {
      throw new NotFoundException();
    }
    return client;
  }
}
