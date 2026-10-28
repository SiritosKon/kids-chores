import { startAuthentication } from '@simplewebauthn/browser';
import { fetchPasskeyLoginOptions, passkeyLogin, rememberPasskeyId } from '@/entities/account';

export const signInWithPasskey = async (): Promise<boolean> => {
  const flow = await fetchPasskeyLoginOptions();
  if (!flow) {
    return false;
  }
  try {
    const response = await startAuthentication({ optionsJSON: flow.options });
    const done = await passkeyLogin(flow.flowId, response);
    if (done) {
      rememberPasskeyId(response.id);
    }
    return done;
  } catch {
    return false;
  }
};
