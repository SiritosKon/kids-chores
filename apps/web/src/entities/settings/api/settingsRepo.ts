import { liveQuery, type Subscription } from 'dexie';
import { table } from '@/shared/api/db';
import type { Locale } from '@/shared/i18n';
import { settingsSchema, storedSettingsSchema } from '../model/schema';
import { SETTINGS_ID, INITIAL_BONUS, NO_STREAK } from '../model/constants';
import { hashSecret, normalizeAnswer } from '../lib/secretHash';
import type { PinQuestion, PinRecovery, Settings } from '../model/types';

export const settingsTable = table<Settings>('settings');

export const getSettings = async (): Promise<Settings | undefined> => {
  const row = await settingsTable.get(SETTINGS_ID);
  return row ? storedSettingsSchema.parse(row) : undefined;
};

export const saveSettings = async (settings: Settings): Promise<void> => {
  await settingsTable.put(settingsSchema.parse(settings));
};

export const watchSettings = (onNext: (settings: Settings | undefined) => void): Subscription =>
  liveQuery(getSettings).subscribe({ next: onNext });

export const questionHash = async ({ question, answer }: PinRecovery): Promise<PinQuestion> => ({
  question: question.trim(),
  answer: await hashSecret(normalizeAnswer(answer)),
});

export const setupParentPin = async (pin: string, locale: Locale, recovery: PinRecovery | null = null): Promise<void> => {
  const pinHash = await hashSecret(pin);
  const pinQuestion = recovery ? await questionHash(recovery) : null;
  const existing = await getSettings();
  await saveSettings(
    existing
      ? { ...existing, parentPin: null, pinHash, pinQuestion: pinQuestion ?? existing.pinQuestion }
      : {
          id: SETTINGS_ID,
          parentPin: null,
          pinHash,
          pinQuestion,
          bonus: INITIAL_BONUS,
          streak: NO_STREAK,
          tourPending: true,
          locale,
        }
  );
};
