import { z } from 'zod';

export const streamReplySchema = z
  .array(z.tuple([z.string(), z.array(z.tuple([z.string(), z.array(z.string())]))]))
  .nullable();
