import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { MeResponse } from '@kids-chores/contracts';
import { fetchMe, fetchServerAuth, requestAccountRemoval, requestSignOut } from '../api/accountApi';
import { storeAccountPhoto, storedAccountPhoto } from '../lib/accountPhoto';
import { downloadProviderPhoto, providerPhotoUrl } from '../lib/providerPhoto';
import { forgetAccount, rememberAccount, rememberedAccount } from '../lib/rememberedAccount';
import { wipeDevice } from '../lib/wipeDevice';
import type { ServerAuth } from './types';

export const useAccountStore = defineStore('account', () => {
  const server = ref<ServerAuth | null>(null);
  const me = ref<MeResponse | null>(rememberedAccount());
  const photo = ref<string | null>(me.value ? storedAccountPhoto(me.value.userId) : null);
  const loaded = ref(false);
  const signedIn = computed(() => me.value !== null);
  const name = computed(() => me.value?.name ?? null);

  const refresh = async (): Promise<void> => {
    const [auth, result] = await Promise.all([fetchServerAuth(), fetchMe()]);
    server.value = auth;
    if (result.status === 'signedIn') {
      me.value = result.me;
      rememberAccount(result.me);
    } else if (result.status === 'signedOut') {
      me.value = null;
      forgetAccount();
    }
    photo.value = me.value ? storedAccountPhoto(me.value.userId) : null;
    loaded.value = true;
  };

  const adoptProviderPhoto = async (url: string): Promise<void> => {
    const source = providerPhotoUrl(url);
    if (!source || !me.value) {
      return;
    }
    const downloaded = await downloadProviderPhoto(source);
    if (me.value && storeAccountPhoto(me.value.userId, downloaded)) {
      photo.value = downloaded;
    }
  };

  const leave = async (request: () => Promise<boolean>): Promise<boolean> => {
    if (!(await request())) {
      return false;
    }
    me.value = null;
    photo.value = null;
    await wipeDevice();
    return true;
  };

  const signOut = (): Promise<boolean> => leave(requestSignOut);

  const remove = (): Promise<boolean> => leave(requestAccountRemoval);

  return { server, me, photo, loaded, signedIn, name, refresh, adoptProviderPhoto, signOut, remove };
});
