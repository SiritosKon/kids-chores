import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const CHANGELOG_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'src/entities/app-version/model/changelog.ts'
);

const ENTRY_PATTERN = /version:\s*'([^']+)',\s*date:\s*'([^']+)',\s*notes:\s*\[([\s\S]*?)\]/g;
const NOTE_PATTERN = /'((?:[^'\\]|\\.)*)'/g;

export const parseVersion = (version) => {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) {
    throw new Error(`not a plain semver version: ${version}`);
  }
  return match.slice(1).map(Number);
};

const compare = (first, second) => {
  const a = parseVersion(first);
  const b = parseVersion(second);
  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
};

export const isReleaseVersion = (version) => parseVersion(version)[2] === 0;

export const parseChangelog = (source) =>
  [...source.matchAll(ENTRY_PATTERN)].map(([, version, date, notes]) => ({
    version,
    date,
    notes: [...notes.matchAll(NOTE_PATTERN)].map(([, note]) => note.replace(/\\(.)/g, '$1')),
  }));

export const releaseEntries = (entries, version) => {
  if (!entries.some((entry) => entry.version === version)) {
    throw new Error(`changelog has no entry for ${version}`);
  }
  const previousRelease = entries
    .map((entry) => entry.version)
    .filter((candidate) => isReleaseVersion(candidate) && compare(candidate, version) < 0)
    .sort(compare)
    .at(-1);
  return entries
    .filter((entry) => compare(entry.version, version) <= 0)
    .filter((entry) => previousRelease === undefined || compare(entry.version, previousRelease) > 0)
    .sort((first, second) => compare(second.version, first.version));
};

export const renderNotes = (entries) =>
  entries
    .map((entry) => [`## ${entry.version} — ${entry.date}`, '', ...entry.notes.map((note) => `- ${note}`)].join('\n'))
    .join('\n\n') + '\n';

const main = () => {
  const version = process.argv[2];
  if (!version) {
    throw new Error('usage: node scripts/releaseNotes.mjs <version>');
  }
  const entries = parseChangelog(readFileSync(CHANGELOG_PATH, 'utf8'));
  process.stdout.write(renderNotes(releaseEntries(entries, version)));
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
