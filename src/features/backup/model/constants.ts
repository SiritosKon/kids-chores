import { completionsTable } from '@/entities/completion';
import { spendsTable } from '@/entities/spend';
import { childrenCatalogue } from '@/entities/child';
import { tasksCatalogue } from '@/entities/task';
import { rewardsCatalogue, variantsCatalogue, variantPhotosTable } from '@/entities/reward';
import { settingsTable } from '@/entities/settings';

export const BACKUP_VERSION = 5;

export const BACKUP_TABLES = [
  completionsTable,
  spendsTable,
  childrenCatalogue.table,
  tasksCatalogue.table,
  rewardsCatalogue.table,
  variantsCatalogue.table,
  variantPhotosTable,
  settingsTable,
];
