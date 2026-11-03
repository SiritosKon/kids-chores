import type { z } from 'zod';
import type { mailpitMessageSchema } from './schema';

export interface InjectedCookies {
  cookies: { name: string; value: string }[];
}

export type MailpitMessage = z.infer<typeof mailpitMessageSchema>;
