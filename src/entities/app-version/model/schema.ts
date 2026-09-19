import { z } from 'zod';

export const versionLogEntrySchema = z.object({
  version: z.string().min(1),
  firstSeenAt: z.number().int().nonnegative(),
});

export type VersionLogEntry = z.infer<typeof versionLogEntrySchema>;
