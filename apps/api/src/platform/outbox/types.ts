import type { z } from 'zod';
import type { Prisma } from '../../generated/prisma/client';
import type { outboxRowSchema } from './schema';

export type OutboxRow = z.infer<typeof outboxRowSchema>;

export interface NewEvent {
  type: string;
  version: number;
  familyId: string | null;
  payload: Prisma.InputJsonObject;
}
