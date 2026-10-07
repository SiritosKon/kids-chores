import type { z } from 'zod';
import type { childGoalSchema, childSchema } from './schema';

export type Child = z.infer<typeof childSchema>;

export type ChildGoal = z.infer<typeof childGoalSchema>;
