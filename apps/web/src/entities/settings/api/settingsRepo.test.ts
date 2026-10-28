import { beforeEach, describe, expect, it } from 'vitest';
import { reactive } from 'vue';
import { db } from '@/shared/api/db';
import { pinMatches } from '../lib/pinHash';
import { getSettings, saveSettings, setupParentPin } from './settingsRepo';

beforeEach(async () => {
  if (db.isOpen()) {
    db.close();
  }
  await db.delete();
  await db.open();
});

describe('setupParentPin', () => {
  it('creates settings with the tour pending and the daily bonus on for a fresh device', async () => {
    await setupParentPin('246810', 'es');

    const settings = await getSettings();
    expect(settings).toMatchObject({
      parentPin: null,
      bonus: { enabled: true, points: 2 },
      streak: { enabled: false, milestones: [] },
      tourPending: true,
      locale: 'es',
    });
    expect(settings?.pinHash && (await pinMatches('246810', settings.pinHash))).toBe(true);
  });

  it('only sets the pin when settings already exist', async () => {
    await saveSettings({
      id: 'app',
      parentPin: null,
      pinHash: null,
      bonus: { enabled: true, points: 2 },
      streak: { enabled: false, milestones: [] },
      tourPending: false,
      locale: 'ru',
    });

    await setupParentPin('246810', 'es');

    const settings = await getSettings();
    expect(settings).toMatchObject({ parentPin: null, bonus: { enabled: true, points: 2 }, tourPending: false });
    expect(settings?.pinHash && (await pinMatches('246810', settings.pinHash))).toBe(true);
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
