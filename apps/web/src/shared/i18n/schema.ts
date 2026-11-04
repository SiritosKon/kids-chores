import { z } from 'zod';
import { SUPPORTED_LOCALES } from './constants';

export const localeSchema = z.enum(SUPPORTED_LOCALES);
