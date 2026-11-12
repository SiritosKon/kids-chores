import { defineMessages } from '../lib';

export const signIn = defineMessages({
  ru: {
    google: 'Войти через Google',
    telegram: 'Войти через Telegram',
    passkey: 'Войти по Face ID или Touch ID',
    passkeyFailed: 'Не получилось войти по Face ID или Touch ID',
    devName: 'Имя для dev-входа',
    devSignIn: 'Dev-вход',
    devFailed: 'Dev-вход не получился',
    signedIn: 'Вы вошли в аккаунт',
  },
  en: {
    google: 'Sign in with Google',
    telegram: 'Sign in with Telegram',
    passkey: 'Sign in with Face ID or Touch ID',
    passkeyFailed: "Couldn't sign in with Face ID or Touch ID",
    devName: 'Dev sign-in name',
    devSignIn: 'Dev sign-in',
    devFailed: 'Dev sign-in failed',
    signedIn: "You're signed in",
  },
  es: {
    google: 'Iniciar sesión con Google',
    telegram: 'Iniciar sesión con Telegram',
    passkey: 'Iniciar sesión con Face ID o Touch ID',
    passkeyFailed: 'No se pudo iniciar sesión con Face ID o Touch ID',
    devName: 'Nombre para el acceso de desarrollo',
    devSignIn: 'Acceso de desarrollo',
    devFailed: 'El acceso de desarrollo falló',
    signedIn: 'Has iniciado sesión',
  },
});
