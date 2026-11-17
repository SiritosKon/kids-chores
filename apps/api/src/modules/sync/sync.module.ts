import { Module } from '@nestjs/common';
import { OutboxModule } from '../../platform/outbox';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';

@Module({
  imports: [OutboxModule],
  controllers: [SyncController],
  providers: [SyncService],
})
export class SyncModule {}
