import type { z } from 'zod';
import type { childSchema } from './schema';

export type Child = z.infer<typeof childSchema>;
