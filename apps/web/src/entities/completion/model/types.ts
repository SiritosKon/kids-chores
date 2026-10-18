import type { z } from 'zod';
import type { completionSchema } from './schema';

export type Completion = z.infer<typeof completionSchema>;
