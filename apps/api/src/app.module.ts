import { Module } from '@nestjs/common';
import { ConfigModule } from './platform/config';
import { AppLoggerModule } from './platform/logger';
import { DatabaseModule } from './platform/database';
import { ValkeyModule } from './platform/valkey';
import { RateLimitModule } from './platform/rate-limit';
import { OutboxModule } from './platform/outbox';
import { HttpModule } from './platform/http';
import { StorageModule } from './platform/storage';
import { MetaModule } from './modules/meta';
import { IdentityModule } from './modules/identity';
import { SyncModule } from './modules/sync';
import { MediaModule } from './modules/media';

@Module({
  imports: [
    ConfigModule,
    AppLoggerModule,
    DatabaseModule,
    ValkeyModule,
    RateLimitModule,
    OutboxModule,
    HttpModule,
    StorageModule,
    MetaModule,
    IdentityModule,
    SyncModule,
    MediaModule,
  ],
})
export class AppModule {}
