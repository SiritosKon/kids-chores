import { Inject, Injectable } from '@nestjs/common';
import type { ContactKind, MetaResponse } from '@kids-chores/contracts';
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
        emailSignIn: this.config.EMAIL_SIGN_IN,
        contacts: this.contacts(),
      },
    };
  }

  private contacts(): ContactKind[] {
    const verified = new Set<ContactKind>();
    if (this.config.AUTH_PROVIDERS.includes('google') || this.config.EMAIL_SIGN_IN) {
      verified.add('email');
    }
    if (this.config.AUTH_PROVIDERS.includes('telegram')) {
      verified.add('phone');
    }
    if (this.config.DEV_LOGIN) {
      verified.add('email').add('phone');
    }
    return [...verified];
  }
}
