import { z } from 'zod';

export const sessionSchema = z.object({
  userId: z.uuid(),
  familyId: z.uuid(),
  deviceId: z.uuid(),
  createdAt: z.iso.datetime(),
});
