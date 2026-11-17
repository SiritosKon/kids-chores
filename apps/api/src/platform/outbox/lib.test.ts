import { describe, expect, it } from 'vitest';
import { eventEnvelopeSchema } from '@kids-chores/contracts';
import { toEnvelope } from './lib';

describe('toEnvelope', () => {
  it('turns an outbox row into an event envelope from contracts', () => {
    const envelope = toEnvelope({
      id: '0b8b5f3e-3b7a-4f4e-9d3a-2a6f5b9f1c11',
      type: 'task.completed',
      version: 1,
      family_id: null,
      payload: { taskId: 'teeth' },
      occurred_at: new Date('2026-10-18T12:00:00.000Z'),
    });
    expect(eventEnvelopeSchema.parse(envelope)).toEqual({
      eventId: '0b8b5f3e-3b7a-4f4e-9d3a-2a6f5b9f1c11',
      type: 'task.completed',
      version: 1,
      occurredAt: '2026-10-18T12:00:00.000Z',
      familyId: null,
      payload: { taskId: 'teeth' },
    });
  });
});
