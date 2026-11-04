import { z } from 'zod';

export const pinLockSchema = z.object({
  failures: z.number().int().nonnegative(),
  until: z.number().nonnegative(),
});
