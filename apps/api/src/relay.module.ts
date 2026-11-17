import { Module } from '@nestjs/common';
import { ConfigModule } from './platform/config';
import { AppLoggerModule } from './platform/logger';
import { DatabaseModule } from './platform/database';
import { ValkeyModule } from './platform/valkey';
import { OutboxModule } from './platform/outbox';

@Module({
  imports: [ConfigModule, AppLoggerModule, DatabaseModule, ValkeyModule, OutboxModule],
})
export class RelayModule {}
