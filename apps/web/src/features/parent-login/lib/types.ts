import type { z } from 'zod';
import type { pinLockSchema } from './schema';

export type PinLock = z.infer<typeof pinLockSchema>;
