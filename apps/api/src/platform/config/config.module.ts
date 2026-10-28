import { Global, Module } from '@nestjs/common';
import { APP_CONFIG } from './constants';
import { loadConfig } from './lib';

@Global()
@Module({
  providers: [{ provide: APP_CONFIG, useFactory: () => loadConfig(process.env, __dirname) }],
  exports: [APP_CONFIG],
})
export class ConfigModule {}
