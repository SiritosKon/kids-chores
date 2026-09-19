import { describe, expect, it } from 'vitest';
import { storedSettingsSchema, DEFAULT_PARENT_PIN } from './schema';

describe('storedSettingsSchema', () => {
  it('replaces a legacy password that is not a six-digit pin', () => {
    const settings = storedSettingsSchema.parse({ id: 'app', parentPassword: '54694945' });

    expect(settings.parentPin).toBe(DEFAULT_PARENT_PIN);
  });

  it('carries over a legacy password that already looks like a pin', () => {
    const settings = storedSettingsSchema.parse({ id: 'app', parentPassword: '123456' });

    expect(settings.parentPin).toBe('123456');
  });

  it('fills the bonus and streak rules a row written by an older build lacks', () => {
    const settings = storedSettingsSchema.parse({ id: 'app', parentPin: '111111' });

    expect(settings.bonus).toEqual({ enabled: true, points: 1 });
    expect(settings.streak.milestones).toEqual([
      { id: 'week', days: 7, rewardId: 'bubble-tea' },
    ]);
  });

  it('drops the legacy field from the parsed settings', () => {
    const settings = storedSettingsSchema.parse({ id: 'app', parentPassword: '222222' });

    expect(Object.keys(settings).sort()).toEqual(['bonus', 'id', 'parentPin', 'streak']);
  });
});
