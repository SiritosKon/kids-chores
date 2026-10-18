import { setTimeout as sleep } from 'node:timers/promises';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Redis } from 'ioredis';
import { EVENTS_STREAM } from '@kids-chores/contracts';
import { PrismaService } from '../database';
import { VALKEY } from '../valkey';
import { EVENT_FIELD, RELAY_BATCH_SIZE, RELAY_IDLE_MS } from './constants';
import { toEnvelope } from './lib';
import { outboxRowSchema } from './schema';

@Injectable()
export class RelayService {
  private readonly logger = new Logger(RelayService.name);
  private running = false;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(VALKEY) private readonly valkey: Redis
  ) {}

  async relayOnce(): Promise<number> {
    return this.prisma.$transaction(async (tx) => {
      const rows = outboxRowSchema.array().parse(
        await tx.$queryRaw`
          SELECT id, type, version, family_id, payload, occurred_at
          FROM core.outbox
          WHERE sent_at IS NULL
          ORDER BY occurred_at
          LIMIT ${RELAY_BATCH_SIZE}
          FOR UPDATE SKIP LOCKED`
      );
      if (rows.length === 0) {
        return 0;
      }
      const pipeline = this.valkey.pipeline();
      for (const row of rows) {
        pipeline.xadd(EVENTS_STREAM, '*', EVENT_FIELD, JSON.stringify(toEnvelope(row)));
      }
      const results = await pipeline.exec();
      if (results?.some(([error]) => error !== null)) {
        throw new Error('failed to add events to the stream');
      }
      await tx.outbox.updateMany({
        where: { id: { in: rows.map((row) => row.id) } },
        data: { sentAt: new Date() },
      });
      return rows.length;
    });
  }

  async run(): Promise<void> {
    this.running = true;
    this.logger.log('outbox relay started');
    while (this.running) {
      const sent = await this.relayOnce();
      if (sent > 0) {
        this.logger.log(`relayed ${sent} events`);
      } else {
        await sleep(RELAY_IDLE_MS);
      }
    }
    this.logger.log('outbox relay stopped');
  }

  stop(): void {
    this.running = false;
  }
}
