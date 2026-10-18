import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { messages } from './messages';

const SRC_DIR = fileURLToPath(new URL('../..', import.meta.url));

const sourceFiles = readdirSync(SRC_DIR, { recursive: true, encoding: 'utf8' })
  .filter((file) => /\.(vue|ts)$/.test(file))
  .filter((file) => !file.endsWith('.test.ts') && !file.includes('i18n/messages'));

const namespaces = Object.keys(messages.ru);

const keyPattern = new RegExp(`['"\`]((?:${namespaces.join('|')})\\.[A-Za-z0-9_.]+)['"\`]`, 'g');

const resolve = (tree: unknown, path: string): unknown =>
  path
    .split('.')
    .reduce<unknown>(
      (node, part) => (typeof node === 'object' && node !== null && part in node ? Reflect.get(node, part) : undefined),
      tree
    );

const usedKeys = sourceFiles.flatMap((file) =>
  [...readFileSync(join(SRC_DIR, file), 'utf8').matchAll(keyPattern)].map(([, key = '']) => ({ file, key }))
);

describe('translation keys', () => {
  it('finds keys in the sources', () => {
    expect(usedKeys.length).toBeGreaterThan(0);
  });

  it('points every key used in the code at a Russian message', () => {
    const missing = usedKeys.filter(({ key }) => typeof resolve(messages.ru, key) !== 'string');
    expect(missing).toEqual([]);
  });

  it.each(['en', 'es'] as const)('has every Russian key in %s', (locale) => {
    const leaves = (tree: unknown, prefix = ''): string[] =>
      typeof tree === 'object' && tree !== null
        ? Object.entries(tree).flatMap(([key, value]) => leaves(value, prefix ? `${prefix}.${key}` : key))
        : [prefix];
    expect(leaves(messages[locale]).sort()).toEqual(leaves(messages.ru).sort());
  });
});
