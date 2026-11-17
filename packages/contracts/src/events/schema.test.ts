import { describe, expect, it } from 'vitest';
import { eventEnvelopeSchema } from './schema.js';

describe('eventEnvelopeSchema', () => {
  it('accepts an event with a family and a payload', () => {
    const event = {
      eventId: '0b8b5f3e-3b7a-4f4e-9d3a-2a6f5b9f1c11',
      type: 'task.completed',
      version: 1,
      occurredAt: '2026-10-18T12:00:00.000Z',
      familyId: '6a1e0d7c-5f0b-4c2e-8b8d-9f2e3c4d5a6b',
      payload: { taskId: 'teeth' },
    };
    expect(eventEnvelopeSchema.parse(event)).toEqual(event);
  });

  it('rejects an event without a type', () => {
    expect(
      eventEnvelopeSchema.safeParse({
        eventId: '0b8b5f3e-3b7a-4f4e-9d3a-2a6f5b9f1c11',
        type: '',
        version: 1,
        occurredAt: '2026-10-18T12:00:00.000Z',
        familyId: null,
        payload: {},
      }).success
    ).toBe(false);
  });
});
