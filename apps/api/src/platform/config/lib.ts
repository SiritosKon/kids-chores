import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { z } from 'zod';
import { ROOT_PACKAGE_MARKER } from './constants';
import { envSchema } from './schema';
import type { AppConfig } from './types';

const rootPackageSchema = z.looseObject({ version: z.string().min(1) });

export const readProductVersion = (from: string): string => {
  const candidate = join(from, 'package.json');
  if (existsSync(candidate)) {
    const text = readFileSync(candidate, 'utf8');
    if (text.includes(`"${ROOT_PACKAGE_MARKER}"`)) {
      return rootPackageSchema.parse(JSON.parse(text)).version;
    }
  }
  const parent = dirname(from);
  if (parent === from) {
    throw new Error('root package.json with workspaces not found');
  }
  return readProductVersion(parent);
};

export const loadConfig = (env: NodeJS.ProcessEnv, from: string): AppConfig => ({
  ...envSchema.parse(env),
  APP_VERSION: readProductVersion(from),
});
