import { streamReplySchema } from './schema';
import type { StreamMessage } from './types';

const toFields = (flat: readonly string[]): Record<string, string> =>
  Object.fromEntries(
    flat.flatMap((value, index) => (index % 2 === 0 ? [[value, flat[index + 1] ?? '']] : []))
  );

export const readMessages = (reply: unknown): StreamMessage[] =>
  (streamReplySchema.parse(reply) ?? []).flatMap(([, entries]) =>
    entries.map(([id, flat]) => ({ id, fields: toFields(flat) }))
  );

export const isBusyGroupError = (error: unknown): boolean =>
  error instanceof Error && error.message.startsWith('BUSYGROUP');
