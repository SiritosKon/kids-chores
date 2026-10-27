import { startRegistration } from '@simplewebauthn/browser';
import {
  fetchPasskeyCreationOptions,
  forgetPasskeyId,
  rememberedPasskeyId,
  rememberPasskeyId,
  removePasskey,
  savePasskey,
} from '@/entities/account';

export const enablePasskey = async (): Promise<boolean> => {
  const options = await fetchPasskeyCreationOptions();
  if (!options) {
    return false;
  }
  try {
    const response = await startRegistration({ optionsJSON: options });
    const saved = await savePasskey(response);
    if (saved) {
      rememberPasskeyId(response.id);
    }
    return saved;
  } catch {
    return false;
  }
};

export const disablePasskey = async (): Promise<boolean> => {
  const id = rememberedPasskeyId();
  if (!id) {
    return false;
  }
  const removed = await removePasskey(id);
  if (removed) {
    forgetPasskeyId();
  }
  return removed;
};
