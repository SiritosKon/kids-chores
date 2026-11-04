import type { z } from 'zod';
import type { streakStateSchema } from './schema';

export type StreakState = z.infer<typeof streakStateSchema>;
