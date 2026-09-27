import { describe, expect, it } from 'vitest';
import { isReleaseVersion, parseChangelog, releaseEntries, renderNotes } from './releaseNotes.mjs';

const SOURCE = `export const CHANGELOG = [
  {
    version: '0.3.0',
    date: '2026-09-27',
    notes: ['Инструкция «Как добавить на экран»'],
  },
  {
    version: '0.2.8',
    date: '2026-09-26',
    notes: [
      'Редакторы в родительском режиме',
      'Огонёк со второго дня',
    ],
  },
  {
    version: '0.2.7',
    date: '2026-09-19',
    notes: ['Экран загрузки'],
  },
  {
    version: '0.2.0',
    date: '2026-09-10',
    notes: ['Переход на TypeScript'],
  },
  {
    version: '0.1.8',
    date: '2026-09-01',
    notes: ['Мороженое'],
  },
];`;

const entries = parseChangelog(SOURCE);
const versions = (version) => releaseEntries(entries, version).map((entry) => entry.version);

describe('isReleaseVersion', () => {
  it('releases minor and major versions only', () => {
    expect(isReleaseVersion('0.3.0')).toBe(true);
    expect(isReleaseVersion('1.0.0')).toBe(true);
    expect(isReleaseVersion('0.2.8')).toBe(false);
  });
});

describe('releaseEntries', () => {
  it('collects every version since the previous minor release', () => {
    expect(versions('0.3.0')).toEqual(['0.3.0', '0.2.8', '0.2.7']);
  });

  it('stops at the previous release boundary', () => {
    expect(versions('0.2.0')).toEqual(['0.2.0', '0.1.8']);
  });

  it('refuses a version the changelog does not describe', () => {
    expect(() => releaseEntries(entries, '0.4.0')).toThrow('0.4.0');
  });
});

describe('renderNotes', () => {
  it('writes one section per version, newest first', () => {
    expect(renderNotes(releaseEntries(entries, '0.3.0'))).toBe(
      [
        '## 0.3.0 — 2026-09-27',
        '',
        '- Инструкция «Как добавить на экран»',
        '',
        '## 0.2.8 — 2026-09-26',
        '',
        '- Редакторы в родительском режиме',
        '- Огонёк со второго дня',
        '',
        '## 0.2.7 — 2026-09-19',
        '',
        '- Экран загрузки',
        '',
      ].join('\n')
    );
  });
});
