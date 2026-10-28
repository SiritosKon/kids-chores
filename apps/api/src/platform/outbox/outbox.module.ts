import { Module } from '@nestjs/common';
import { OutboxService } from './outbox.service';
import { RelayService } from './relay.service';

@Module({
  providers: [OutboxService, RelayService],
  exports: [OutboxService, RelayService],
})
export class OutboxModule {}
