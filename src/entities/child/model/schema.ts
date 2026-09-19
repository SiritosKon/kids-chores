import { z } from 'zod';

export const childSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  carColor: z.string().min(1),
  weeklyGoal: z.number().int().positive(),
  photo: z.string().min(1),
});

export type Child = z.infer<typeof childSchema>;
