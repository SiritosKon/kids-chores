import { ref } from 'vue';
import { defineStore } from 'pinia';
import Dexie from 'dexie';
import { useAccountStore } from '@/entities/account';
import { MEDIA_SYNC_DELAY_MS, MEDIA_TABLES } from './constants';
import { syncPhotos } from './engine';

export const useMediaSyncStore = defineStore('media-sync', () => {
  const account = useAccountStore();
  const revision = ref(0);
  let running: Promise<void> | null = null;
  let again = false;
  let started = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const run = (): Promise<void> => {
    if (running) {
      again = true;
      return running;
    }
    running = (async () => {
      do {
        again = false;
        if (account.signedIn && navigator.onLine) {
          const changed = await syncPhotos().catch(() => false);
          if (changed) {
            revision.value += 1;
          }
        }
      } while (again);
    })().finally(() => {
      running = null;
    });
    return running;
  };

  const schedule = (): void => {
    clearTimeout(timer);
    timer = setTimeout(() => void run(), MEDIA_SYNC_DELAY_MS);
  };

  const start = (): void => {
    if (started) {
      return;
    }
    started = true;
    Dexie.on('storagemutated', (parts) => {
      if (Object.keys(parts).some((part) => MEDIA_TABLES.some((name) => part.includes(`/${name}/`)))) {
        schedule();
      }
    });
    window.addEventListener('online', schedule);
    schedule();
  };

  return { revision, run, start };
});
