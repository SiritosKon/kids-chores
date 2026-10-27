import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { MeResponse } from '@kids-chores/contracts';
import { fetchMe, fetchServerAuth, requestRename, requestSignOut } from '../api/accountApi';
import { storeAccountPhoto, storedAccountPhoto } from '../lib/accountPhoto';
import type { ServerAuth } from './types';

export const useAccountStore = defineStore('account', () => {
  const server = ref<ServerAuth | null>(null);
  const me = ref<MeResponse | null>(null);
  const photo = ref<string | null>(null);
  const loaded = ref(false);
  const signedIn = computed(() => me.value !== null);
  const name = computed(() => me.value?.name ?? null);

  const refresh = async (): Promise<void> => {
    server.value = await fetchServerAuth();
    me.value = server.value ? await fetchMe() : null;
    photo.value = me.value ? storedAccountPhoto(me.value.userId) : null;
    loaded.value = true;
  };

  const rename = async (next: string | null): Promise<boolean> => {
    const updated = await requestRename(next);
    if (updated) {
      me.value = updated;
    }
    return updated !== null;
  };

  const setPhoto = (next: string | null): boolean => {
    if (!me.value || !storeAccountPhoto(me.value.userId, next)) {
      return false;
    }
    photo.value = next;
    return true;
  };

  const signOut = async (): Promise<boolean> => {
    const done = await requestSignOut();
    if (done) {
      me.value = null;
      photo.value = null;
    }
    return done;
  };

  return { server, me, photo, loaded, signedIn, name, refresh, rename, setPhoto, signOut };
});
