import { describe, expect, it } from 'vitest';
import { calendarNames, detectLocale, russianPlural } from './lib';

describe('detectLocale', () => {
  it('takes the first supported device language', () => {
    expect(detectLocale(['de-DE', 'es-MX', 'ru-RU'])).toBe('es');
    expect(detectLocale(['ru'])).toBe('ru');
    expect(detectLocale(['EN-gb'])).toBe('en');
  });

  it('falls back to English', () => {
    expect(detectLocale(['de-DE', 'fr'])).toBe('en');
    expect(detectLocale([])).toBe('en');
  });
});

describe('russianPlural', () => {
  it.each([
    [1, 0],
    [21, 0],
    [2, 1],
    [24, 1],
    [0, 2],
    [5, 2],
    [11, 2],
    [14, 2],
    [111, 2],
  ])('picks the form for %i', (count, form) => {
    expect(russianPlural(count, 3)).toBe(form);
  });

  it('copes with messages that have fewer forms', () => {
    expect(russianPlural(5, 1)).toBe(0);
    expect(russianPlural(1, 2)).toBe(0);
    expect(russianPlural(5, 2)).toBe(1);
  });
});

describe('calendarNames', () => {
  it('names months and weekdays from Sunday in the given language', () => {
    const names = calendarNames('en-US');
    expect(names.months[0]).toBe('January');
    expect(names.days[0]).toBe('Sunday');
    expect(names.daysShort).toHaveLength(7);
    expect(calendarNames('ru-RU').months[2]).toBe('Март');
  });
});
