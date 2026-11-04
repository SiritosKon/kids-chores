import type { z } from 'zod';
import type { backupSchema } from './schema';

export type Backup = z.infer<typeof backupSchema>;
