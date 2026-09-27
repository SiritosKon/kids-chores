import { beforeEach, describe, expect, it } from 'vitest';
import { reactive } from 'vue';
import { db } from '@/shared/api/db';
import { getSettings, saveSettings, setupParentPin } from './settingsRepo';

beforeEach(async () => {
  if (db.isOpen()) {
    db.close();
  }
  await db.delete();
  await db.open();
});

describe('setupParentPin', () => {
  it('creates settings with the tour pending on a fresh device', async () => {
    await setupParentPin('246810');

    expect(await getSettings()).toMatchObject({
      parentPin: '246810',
      bonus: { enabled: false },
      streak: { enabled: false, milestones: [] },
      tourPending: true,
    });
  });

  it('only sets the pin when settings already exist', async () => {
    await saveSettings({
      id: 'app',
      parentPin: null,
      bonus: { enabled: true, points: 2 },
      streak: { enabled: false, milestones: [] },
      tourPending: false,
    });

    await setupParentPin('246810');

    expect(await getSettings()).toMatchObject({
      parentPin: '246810',
      bonus: { enabled: true, points: 2 },
      tourPending: false,
    });
  });
});

describe('saveSettings', () => {
  it('stores settings that come from reactive state', async () => {
    const settings = reactive({
      id: 'app' as const,
      parentPin: '246810',
      bonus: { enabled: true, points: 1 },
      streak: { enabled: true, milestones: [{ id: 'week', days: 7, rewardId: 'bubble-tea' }] },
      tourPending: false,
    });

    await saveSettings({ ...settings, streak: { enabled: true, milestones: settings.streak.milestones } });

    expect((await getSettings())?.streak.milestones).toEqual([{ id: 'week', days: 7, rewardId: 'bubble-tea' }]);
  });
});
