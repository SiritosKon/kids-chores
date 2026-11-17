import { randomUUID } from 'node:crypto';
import type { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { Redis } from 'ioredis';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { EVENTS_STREAM, eventEnvelopeSchema } from '@kids-chores/contracts';
import { RelayModule } from './relay.module';
import { PrismaService } from './platform/database';
import { OutboxService, RelayService } from './platform/outbox';
import { VALKEY } from './platform/valkey';

describe('outbox relay', () => {
  let app: INestApplicationContext;

  beforeAll(async () => {
    app = await NestFactory.createApplicationContext(RelayModule, { logger: false, abortOnError: false });
  });

  afterAll(async () => {
    await app.close();
  });

  const drain = async (): Promise<void> => {
    if ((await app.get(RelayService).relayOnce()) > 0) {
      await drain();
    }
  };

  it('moves a recorded event into the Valkey stream exactly once', async () => {
    const prisma = app.get(PrismaService);
    const marker = randomUUID();
    await prisma.$transaction((tx) =>
      app.get(OutboxService).record(tx, {
        type: 'test.relayed',
        version: 1,
        familyId: null,
        payload: { marker },
      })
    );

    await drain();
    await drain();

    const entries = await app.get<Redis>(VALKEY).xrevrange(EVENTS_STREAM, '+', '-', 'COUNT', 500);
    const relayed = entries
      .map(([, fields]) => eventEnvelopeSchema.parse(JSON.parse(fields[1] ?? '')))
      .filter((event) => event.payload.marker === marker);
    expect(relayed).toHaveLength(1);

    const row = await prisma.outbox.findUniqueOrThrow({ where: { id: relayed[0]?.eventId } });
    expect(row.sentAt).not.toBeNull();
  });
});
