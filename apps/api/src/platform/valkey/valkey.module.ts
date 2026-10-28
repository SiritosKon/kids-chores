import { Global, Inject, Module, type OnApplicationShutdown } from '@nestjs/common';
import { Redis } from 'ioredis';
import { APP_CONFIG, type AppConfig } from '../config';
import { VALKEY } from './constants';

@Global()
@Module({
  providers: [
    {
      provide: VALKEY,
      inject: [APP_CONFIG],
      useFactory: (config: AppConfig) => new Redis(config.VALKEY_URL),
    },
  ],
  exports: [VALKEY],
})
export class ValkeyModule implements OnApplicationShutdown {
  constructor(@Inject(VALKEY) private readonly valkey: Redis) {}

  async onApplicationShutdown(): Promise<void> {
    await this.valkey.quit();
  }
}
