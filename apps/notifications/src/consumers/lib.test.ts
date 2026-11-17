import { describe, expect, it } from 'vitest';
import { isBusyGroupError, readMessages } from './lib';

describe('readMessages', () => {
  it('flattens a XREADGROUP reply into messages with fields', () => {
    const reply = [['events', [['1729250000000-0', ['event', '{"type":"task.completed"}']]]]];
    expect(readMessages(reply)).toEqual([
      { id: '1729250000000-0', fields: { event: '{"type":"task.completed"}' } },
    ]);
  });

  it('reads an empty reply after the block timeout as no messages', () => {
    expect(readMessages(null)).toEqual([]);
  });
});

describe('isBusyGroupError', () => {
  it('recognises the error Valkey returns for an existing group', () => {
    expect(isBusyGroupError(new Error('BUSYGROUP Consumer Group name already exists'))).toBe(true);
    expect(isBusyGroupError(new Error('NOGROUP'))).toBe(false);
  });
});
