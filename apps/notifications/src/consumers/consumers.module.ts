import { Module } from '@nestjs/common';
import { EventsConsumer } from './events.consumer';

@Module({
  providers: [EventsConsumer],
})
export class ConsumersModule {}
