import type { ShownFailure } from '../model/types';
import type { TroubleLook } from './types';

export const SYNC_FAILURES: readonly ShownFailure[] = ['offline', 'failed', 'signedOut'];

export const TROUBLE_LOOKS: Record<ShownFailure, TroubleLook> = {
  offline: { icon: 'cloud_off', messageKey: 'sync.offline' },
  failed: { icon: 'cloud_off', messageKey: 'sync.failed' },
  signedOut: { icon: 'lock_clock', messageKey: 'sync.signedOut' },
};
