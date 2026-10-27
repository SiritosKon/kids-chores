import type { z } from 'zod';
import type { sessionSchema } from './schema.js';

export type Session = z.infer<typeof sessionSchema>;
