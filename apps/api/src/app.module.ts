import { Module } from '@nestjs/common';
import { ConfigModule } from './platform/config';
import { AppLoggerModule } from './platform/logger';
import { DatabaseModule } from './platform/database';
import { ValkeyModule } from './platform/valkey';
import { OutboxModule } from './platform/outbox';
import { HttpModule } from './platform/http';
import { MetaModule } from './modules/meta';
import { IdentityModule } from './modules/identity';
import { SyncModule } from './modules/sync';

@Module({
  imports: [
    ConfigModule,
    AppLoggerModule,
    DatabaseModule,
    ValkeyModule,
    OutboxModule,
    HttpModule,
    MetaModule,
    IdentityModule,
    SyncModule,
  ],
})
export class AppModule {}
