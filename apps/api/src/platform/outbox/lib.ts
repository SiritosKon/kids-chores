import type { EventEnvelope } from '@kids-chores/contracts';
import type { OutboxRow } from './types';

export const toEnvelope = (row: OutboxRow): EventEnvelope => ({
  eventId: row.id,
  type: row.type,
  version: row.version,
  occurredAt: row.occurred_at.toISOString(),
  familyId: row.family_id,
  payload: row.payload,
});
