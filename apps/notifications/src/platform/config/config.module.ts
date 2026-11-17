import { Global, Module } from '@nestjs/common';
import { APP_CONFIG } from './constants';
import { envSchema } from './schema';

@Global()
@Module({
  providers: [{ provide: APP_CONFIG, useFactory: () => envSchema.parse(process.env) }],
  exports: [APP_CONFIG],
})
export class ConfigModule {}
