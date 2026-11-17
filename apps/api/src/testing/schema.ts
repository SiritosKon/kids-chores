import { z } from 'zod';

export const mailpitSearchSchema = z.object({
  messages: z.array(z.object({ ID: z.string().min(1) })),
});

export const mailpitMessageSchema = z.object({
  Subject: z.string(),
  Text: z.string(),
});
