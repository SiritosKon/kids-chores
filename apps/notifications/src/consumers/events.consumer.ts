import {
  Inject,
  Injectable,
  Logger,
  type BeforeApplicationShutdown,
  type OnApplicationBootstrap,
} from '@nestjs/common';
import type { Redis } from 'ioredis';
import { EVENTS_STREAM, eventEnvelopeSchema } from '@kids-chores/contracts';
import { APP_CONFIG, type AppConfig } from '../platform/config';
import { VALKEY } from '../platform/valkey';
import { CONSUMER_GROUP, EVENT_FIELD, READ_BLOCK_MS, READ_COUNT } from './constants';
import { isBusyGroupError, readMessages } from './lib';
import type { StreamMessage } from './types';

@Injectable()
export class EventsConsumer implements OnApplicationBootstrap, BeforeApplicationShutdown {
  private readonly logger = new Logger(EventsConsumer.name);
  private running = false;
  private loop: Promise<void> = Promise.resolve();

  constructor(
    @Inject(VALKEY) private readonly valkey: Redis,
    @Inject(APP_CONFIG) private readonly config: AppConfig
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.ensureGroup();
    this.running = true;
    this.loop = this.consume();
  }

  async beforeApplicationShutdown(): Promise<void> {
    this.running = false;
    await this.loop;
  }

  private async ensureGroup(): Promise<void> {
    try {
      await this.valkey.xgroup('CREATE', EVENTS_STREAM, CONSUMER_GROUP, '0', 'MKSTREAM');
    } catch (error) {
      if (!isBusyGroupError(error)) {
        throw error;
      }
    }
  }

  private async consume(): Promise<void> {
    this.logger.log(`reading ${EVENTS_STREAM} as ${CONSUMER_GROUP}/${this.config.CONSUMER_NAME}`);
    while (this.running) {
      const reply = await this.valkey.xreadgroup(
        'GROUP',
        CONSUMER_GROUP,
        this.config.CONSUMER_NAME,
        'COUNT',
        READ_COUNT,
        'BLOCK',
        READ_BLOCK_MS,
        'STREAMS',
        EVENTS_STREAM,
        '>'
      );
      for (const message of readMessages(reply)) {
        await this.handle(message);
      }
    }
  }

  private async handle(message: StreamMessage): Promise<void> {
    const parsed = eventEnvelopeSchema.safeParse(JSON.parse(message.fields[EVENT_FIELD] ?? 'null'));
    if (parsed.success) {
      this.logger.log(`event ${parsed.data.type} v${parsed.data.version} ${parsed.data.eventId}`);
    } else {
      this.logger.warn(`skipped malformed message ${message.id}`);
    }
    await this.valkey.xack(EVENTS_STREAM, CONSUMER_GROUP, message.id);
  }
}
