import { Inject, Injectable } from '@nestjs/common';
import type { MetaResponse } from '@kids-chores/contracts';
import { APP_CONFIG, type AppConfig } from '../../platform/config';

@Injectable()
export class MetaService {
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  read(): MetaResponse {
    return {
      version: this.config.APP_VERSION,
      minClientVersion: this.config.MIN_CLIENT_VERSION,
      commit: this.config.GIT_COMMIT,
      region: this.config.REGION,
      auth: {
        providers: this.config.AUTH_PROVIDERS,
        devLogin: this.config.DEV_LOGIN,
      },
    };
  }
}
