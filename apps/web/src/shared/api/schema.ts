import { z } from 'zod';

export const completionKeySchema = z.looseObject({
  id: z.string(),
  childId: z.string(),
  taskId: z.string(),
  date: z.string(),
  createdAt: z.number().optional(),
  updatedAt: z.number().optional(),
});
