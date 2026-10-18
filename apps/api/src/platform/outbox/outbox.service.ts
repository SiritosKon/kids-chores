import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import type { NewEvent } from './types';

@Injectable()
export class OutboxService {
  async record(tx: Prisma.TransactionClient, event: NewEvent): Promise<void> {
    await tx.outbox.create({
      data: {
        id: randomUUID(),
        type: event.type,
        version: event.version,
        familyId: event.familyId,
        payload: event.payload,
      },
    });
  }
}
