import { setTimeout as sleep } from 'node:timers/promises';
import { MAIL_WAIT_MS, MAIL_WAIT_TRIES, MAILPIT_URL } from './constants';
import { mailpitMessageSchema, mailpitSearchSchema } from './schema';
import type { MailpitMessage } from './types';

const readJson = async (path: string): Promise<unknown> => (await fetch(`${MAILPIT_URL}${path}`)).json();

export const lastMailTo = async (address: string, tries = MAIL_WAIT_TRIES): Promise<MailpitMessage> => {
  const query = encodeURIComponent(`to:"${address}"`);
  const [latest] = mailpitSearchSchema.parse(await readJson(`/api/v1/search?query=${query}`)).messages;
  if (latest) {
    return mailpitMessageSchema.parse(await readJson(`/api/v1/message/${latest.ID}`));
  }
  if (tries <= 1) {
    throw new Error(`no mail to ${address}`);
  }
  await sleep(MAIL_WAIT_MS);
  return lastMailTo(address, tries - 1);
};

export const mailCount = async (address: string): Promise<number> => {
  const query = encodeURIComponent(`to:"${address}"`);
  return mailpitSearchSchema.parse(await readJson(`/api/v1/search?query=${query}`)).messages.length;
};
