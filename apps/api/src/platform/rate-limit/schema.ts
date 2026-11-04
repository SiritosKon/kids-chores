import { z } from 'zod';

export const counterRepliesSchema = z.tuple([z.unknown(), z.number().int(), z.number().int()]);
