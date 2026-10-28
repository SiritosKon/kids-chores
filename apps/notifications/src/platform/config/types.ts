import type { z } from 'zod';
import type { envSchema } from './schema';

export type AppConfig = z.infer<typeof envSchema>;
