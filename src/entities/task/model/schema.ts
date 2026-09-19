import { z } from 'zod';

export const taskSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  icon: z.string().min(1),
  points: z.number().int(),
  color: z.string().min(1),
});

export type Task = z.infer<typeof taskSchema>;
