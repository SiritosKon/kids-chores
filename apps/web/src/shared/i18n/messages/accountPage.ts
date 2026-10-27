import { defineMessages } from '../lib';

export const accountPage = defineMessages({
  ru: {
    title: 'Аккаунт',
    guest:
      'Сейчас данные хранятся только на этом устройстве. Войдите, чтобы они хранились в аккаунте и были на всех устройствах семьи.',
    signedIn: 'Вы вошли в аккаунт',
    deviceNote: 'Это устройство подключено к аккаунту семьи.',
    parentOnly: 'Face ID и выход из аккаунта — в родительском режиме.',
    enterParentMode: 'Войти в родительский режим',
    signOut: 'Выйти из аккаунта',
    signOutTitle: 'Выйти из аккаунта?',
    signOutMessage: 'Данные на этом устройстве останутся.',
    signedOut: 'Вы вышли из аккаунта',
    signOutFailed: 'Не получилось выйти, попробуйте ещё раз',
    signInFailed: 'Не получилось войти. Попробуйте ещё раз.',
    unavailable: 'Сервер недоступен. Вход появится, когда приложение подключится к нему.',
  },
  en: {
    title: 'Account',
    guest:
      "Right now your data lives only on this device. Sign in to keep it in your account and on all your family's devices.",
    signedIn: "You're signed in",
    deviceNote: 'This device is connected to your family account.',
    parentOnly: 'Face ID and signing out are in parent mode.',
    enterParentMode: 'Enter parent mode',
    signOut: 'Sign out',
    signOutTitle: 'Sign out?',
    signOutMessage: 'The data on this device stays.',
    signedOut: "You're signed out",
    signOutFailed: "Couldn't sign out, please try again",
    signInFailed: "Couldn't sign in. Please try again.",
    unavailable: 'The server is unavailable. Sign-in will appear once the app connects to it.',
  },
  es: {
    title: 'Cuenta',
    guest:
      'Ahora tus datos solo están en este dispositivo. Inicia sesión para guardarlos en tu cuenta y tenerlos en todos los dispositivos de la familia.',
    signedIn: 'Has iniciado sesión',
    deviceNote: 'Este dispositivo está conectado a la cuenta familiar.',
    parentOnly: 'Face ID y el cierre de sesión están en el modo padres.',
    enterParentMode: 'Entrar al modo padres',
    signOut: 'Cerrar sesión',
    signOutTitle: '¿Cerrar sesión?',
    signOutMessage: 'Los datos de este dispositivo se quedan.',
    signedOut: 'Has cerrado sesión',
    signOutFailed: 'No se pudo cerrar sesión, inténtalo de nuevo',
    signInFailed: 'No se pudo iniciar sesión. Inténtalo de nuevo.',
    unavailable: 'El servidor no está disponible. El inicio de sesión aparecerá cuando la app se conecte a él.',
  },
});
