import { computed, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import Dexie from 'dexie';
import { SYNC_KINDS } from '@kids-chores/contracts';
import { useAccountStore } from '@/entities/account';
import { touchesTables } from '../lib/fields';
import { CAPTURE_DELAY_MS, RETRY_DELAY_MS } from './constants';
import { pendingChanges, syncFamily } from './engine';
import type { SyncHooks, SyncStatus } from './types';

export const useSyncStore = defineStore('sync', () => {
  const account = useAccountStore();
  const status = ref<SyncStatus>('off');
  const pending = ref(0);
  const rejected = ref(0);
  const syncedAt = ref<number | null>(null);
  const revision = ref(0);
  const familyId = computed(() => account.me?.familyId ?? null);

  let hooks: SyncHooks | null = null;
  let running: Promise<void> | null = null;
  let again = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const schedule = (delay: number): void => {
    clearTimeout(timer);
    timer = setTimeout(() => void run(), delay);
  };

  const runOnce = async (): Promise<void> => {
    const family = familyId.value;
    if (family === null) {
      status.value = 'off';
      return;
    }
    status.value = 'syncing';
    const report = await syncFamily(family);
    rejected.value += report.rejected;
    pending.value = await pendingChanges();
    if (report.changed) {
      await hooks?.afterRemoteChanges();
      revision.value += 1;
    }
    status.value = report.failure ?? 'synced';
    if (report.failure === undefined) {
      syncedAt.value = Date.now();
      if (pending.value > 0) {
        schedule(CAPTURE_DELAY_MS);
      }
    } else if (report.failure === 'signedOut') {
      await account.refresh();
    } else {
      schedule(RETRY_DELAY_MS);
    }
  };

  const run = (): Promise<void> => {
    if (running) {
      again = true;
      return running;
    }
    running = (async () => {
      do {
        again = false;
        await runOnce().catch(() => {
          status.value = 'failed';
        });
      } while (again);
    })().finally(() => {
      running = null;
    });
    return running;
  };

  const start = (startHooks: SyncHooks): void => {
    if (hooks) {
      return;
    }
    hooks = startHooks;
    Dexie.on('storagemutated', (parts) => {
      if (familyId.value !== null && touchesTables(parts, SYNC_KINDS)) {
        schedule(CAPTURE_DELAY_MS);
      }
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        void run();
      }
    });
    window.addEventListener('online', () => void run());
    window.addEventListener('focus', () => void run());
    watch(familyId, () => void run(), { immediate: true });
  };

  return { status, pending, rejected, syncedAt, revision, start, run };
});
