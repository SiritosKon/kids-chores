import type { SyncStatus } from '../model/types';
import type { StatusLook } from './types';

export const STATUS_LOOKS: Record<SyncStatus, StatusLook> = {
  off: { icon: 'cloud_off', color: 'grey-6' },
  syncing: { icon: 'sync', color: 'primary' },
  synced: { icon: 'cloud_done', color: 'positive' },
  offline: { icon: 'cloud_off', color: 'warning' },
  failed: { icon: 'cloud_off', color: 'warning' },
  signedOut: { icon: 'lock_clock', color: 'warning' },
};
