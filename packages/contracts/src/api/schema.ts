import { z } from 'zod';
import { REGIONS } from '../constants.js';

export const metaResponseSchema = z.object({
  version: z.string().min(1),
  minClientVersion: z.string().min(1),
  commit: z.string().min(1),
  region: z.enum(REGIONS),
});
