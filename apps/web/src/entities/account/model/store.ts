import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { ContactKind, MeResponse, PinHash } from '@kids-chores/contracts';
import { hashPin, pinMatches } from '@/shared/lib/pinHash';
import { fetchMe, fetchServerAuth, renameAccount, requestAccountRemoval, requestSignOut } from '../api/accountApi';
import { requestFamilyLeave } from '../api/familyApi';
import { savePin } from '../api/pinCodeApi';
import { storeAccountPhoto, storedAccountPhoto } from '../lib/accountPhoto';
import { downloadProviderPhoto, providerPhotoUrl } from '../lib/providerPhoto';
import { forgetAccount, rememberAccount, rememberedAccount } from '../lib/rememberedAccount';
import { wipeDevice } from '../lib/wipeDevice';
import type { PinSaveResult, ServerAuth } from './types';

export const useAccountStore = defineStore('account', () => {
  const server = ref<ServerAuth | null>(null);
  const me = ref<MeResponse | null>(rememberedAccount());
  const photo = ref<string | null>(me.value ? storedAccountPhoto(me.value.userId) : null);
  const loaded = ref(false);
  const signedIn = computed(() => me.value !== null);
  const name = computed(() => me.value?.name ?? null);
  const owner = computed(() => me.value?.role === 'owner');
  const contactKinds = computed<readonly ContactKind[]>(() => server.value?.contacts ?? []);
  const pins = computed(() => me.value?.pins ?? []);
  const pinsKnown = computed(() => me.value?.pins !== undefined);
  const ownPin = computed(() => pins.value.find(({ userId }) => userId === me.value?.userId)?.pin ?? null);
  const hasOwnPin = computed(() => ownPin.value !== null);

  const checkPin = async (pin: string): Promise<boolean> =>
    (await Promise.all(pins.value.map(({ pin: stored }) => pinMatches(pin, stored)))).some(Boolean);

  const checkOwnPin = async (pin: string): Promise<boolean> => (ownPin.value ? pinMatches(pin, ownPin.value) : false);

  const storePin = async (hash: PinHash, current?: string): Promise<PinSaveResult> => {
    const result = await savePin({ pin: hash, current });
    const known = me.value;
    if (result === 'ok' && known) {
      me.value = { ...known, pins: [...pins.value.filter(({ userId }) => userId !== known.userId), { userId: known.userId, pin: hash }] };
      rememberAccount(me.value);
    }
    return result;
  };

  const setPin = async (pin: string, current?: string): Promise<PinSaveResult> => {
    const own = ownPin.value;
    const proof = current !== undefined && own ? (await hashPin(current, own.salt, own.iterations)).hash : undefined;
    return storePin(await hashPin(pin), proof);
  };

  const adoptPin = (hash: PinHash): Promise<PinSaveResult> => storePin(hash);

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

  const rename = async (value: string): Promise<boolean> => {
    const current = me.value;
    if (!current || !(await renameAccount(value))) {
      return false;
    }
    me.value = { ...current, name: value.trim() };
    rememberAccount(me.value);
    return true;
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

  const leaveFamily = (): Promise<boolean> => leave(requestFamilyLeave);

  return {
    server,
    me,
    photo,
    loaded,
    signedIn,
    name,
    owner,
    contactKinds,
    pins,
    pinsKnown,
    ownPin,
    hasOwnPin,
    checkPin,
    checkOwnPin,
    setPin,
    adoptPin,
    refresh,
    adoptProviderPhoto,
    rename,
    signOut,
    remove,
    leaveFamily,
  };
});
