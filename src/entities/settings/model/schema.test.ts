import { describe, expect, it } from 'vitest';
import { storedSettingsSchema } from './schema';

describe('storedSettingsSchema', () => {
  it('leaves the pin unset when a legacy password is not six digits', () => {
    const settings = storedSettingsSchema.parse({ id: 'app', parentPassword: '54694945' });

    expect(settings.parentPin).toBeNull();
  });

  it('carries over a legacy password that already looks like a pin', () => {
    const settings = storedSettingsSchema.parse({ id: 'app', parentPassword: '123456' });

    expect(settings.parentPin).toBe('123456');
  });

  it('fills the bonus and streak rules a row written by an older build lacks', () => {
    const settings = storedSettingsSchema.parse({ id: 'app', parentPin: '111111' });

    expect(settings.bonus).toEqual({ enabled: true, points: 1 });
    expect(settings.streak).toEqual({ enabled: false, milestones: [] });
  });

  it('drops the legacy field from the parsed settings', () => {
    const settings = storedSettingsSchema.parse({ id: 'app', parentPassword: '222222' });

    expect(Object.keys(settings).sort()).toEqual([
      'bonus',
      'id',
      'parentPin',
      'streak',
    ]);
  });
});
