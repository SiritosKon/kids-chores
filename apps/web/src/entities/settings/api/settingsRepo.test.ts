import { beforeEach, describe, expect, it } from 'vitest';
import { reactive } from 'vue';
import { db } from '@/shared/api/db';
import { getSettings, saveSettings, setupSettings } from './settingsRepo';

beforeEach(async () => {
  if (db.isOpen()) {
    db.close();
  }
  await db.delete();
  await db.open();
});

describe('setupSettings', () => {
  it('creates settings with the tour pending and the daily bonus on for a fresh device', async () => {
    await setupSettings('es');

    expect(await getSettings()).toMatchObject({
      parentPin: null,
      pinHash: null,
      bonus: { enabled: true, points: 2 },
      streak: { enabled: false, milestones: [] },
      tourPending: true,
      locale: 'es',
    });
  });

  it('leaves settings that already exist alone', async () => {
    const pinHash = { salt: 'c2FsdA==', hash: 'aGFzaA==', iterations: 600_000 };
    await saveSettings({
      id: 'app',
      parentPin: null,
      pinHash,
      bonus: { enabled: true, points: 2 },
      streak: { enabled: false, milestones: [] },
      tourPending: false,
      locale: 'ru',
    });

    await setupSettings('es');

    expect(await getSettings()).toMatchObject({ pinHash, tourPending: false, locale: 'ru' });
  });
});

describe('saveSettings', () => {
  it('stores settings that come from reactive state', async () => {
    const settings = reactive({
      id: 'app' as const,
      parentPin: '246810',
      pinHash: null,
      bonus: { enabled: true, points: 1 },
      streak: { enabled: true, milestones: [{ id: 'week', days: 7, rewardId: 'bubble-tea' }] },
      tourPending: false,
      locale: 'ru' as const,
    });

    await saveSettings({ ...settings, streak: { enabled: true, milestones: settings.streak.milestones } });

    expect((await getSettings())?.streak.milestones).toEqual([{ id: 'week', days: 7, rewardId: 'bubble-tea' }]);
  });
});
