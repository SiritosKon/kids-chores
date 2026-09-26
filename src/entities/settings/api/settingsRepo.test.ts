import { beforeEach, describe, expect, it } from 'vitest';
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
