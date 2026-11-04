export { useAccountStore } from './model/store';
export { default as AccountAvatar } from './ui/AccountAvatar.vue';
export type { ServerAuth } from './model/types';
export {
  devSignIn,
  providerStartUrl,
  fetchPasskeyCreationOptions,
  savePasskey,
  fetchPasskeyLoginOptions,
  passkeyLogin,
  removePasskey,
} from './api/accountApi';
export { rememberedPasskeyId, rememberPasskeyId, forgetPasskeyId } from './lib/passkeyId';
