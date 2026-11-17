import { describe, expect, it } from 'vitest';
import { isIosDevice } from './platform';

const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const IPAD_DESKTOP_MODE = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15';
const ANDROID = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36';

describe('isIosDevice', () => {
  it('recognises an iPhone', () => {
    expect(isIosDevice(IPHONE, 5)).toBe(true);
  });

  it('recognises an iPad that pretends to be a Mac', () => {
    expect(isIosDevice(IPAD_DESKTOP_MODE, 5)).toBe(true);
  });

  it('leaves a real Mac without touch alone', () => {
    expect(isIosDevice(IPAD_DESKTOP_MODE, 0)).toBe(false);
  });

  it('leaves Android alone', () => {
    expect(isIosDevice(ANDROID, 5)).toBe(false);
  });
});
