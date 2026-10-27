import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { MeResponse } from '@kids-chores/contracts';
import { fetchMe, fetchServerAuth, requestSignOut } from '../api/accountApi';
import type { ServerAuth } from './types';

export const useAccountStore = defineStore('account', () => {
  const server = ref<ServerAuth | null>(null);
  const me = ref<MeResponse | null>(null);
  const loaded = ref(false);
  const signedIn = computed(() => me.value !== null);

  const refresh = async (): Promise<void> => {
    server.value = await fetchServerAuth();
    me.value = server.value ? await fetchMe() : null;
    loaded.value = true;
  };

  const signOut = async (): Promise<boolean> => {
    const done = await requestSignOut();
    if (done) {
      me.value = null;
    }
    return done;
  };

  return { server, me, loaded, signedIn, refresh, signOut };
});
