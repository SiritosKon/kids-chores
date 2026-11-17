import { Module } from '@nestjs/common';
import { ConfigModule } from './platform/config';
import { AppLoggerModule } from './platform/logger';
import { ValkeyModule } from './platform/valkey';
import { ConsumersModule } from './consumers';
import { HttpModule } from './http';

@Module({
  imports: [ConfigModule, AppLoggerModule, ValkeyModule, ConsumersModule, HttpModule],
})
export class AppModule {}
