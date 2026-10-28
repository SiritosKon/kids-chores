import { defineMessages } from '../lib';

export const accountPage = defineMessages({
  ru: {
    title: 'Аккаунт',
    guest:
      'Сейчас данные хранятся только на этом устройстве. Войдите, чтобы они хранились в аккаунте и были на всех устройствах семьи.',
    signedIn: 'Вы вошли в аккаунт',
    deviceNote: 'Это устройство подключено к аккаунту семьи.',
    parentOnly: 'Имя, фото, Face ID и выход из аккаунта — в родительском режиме.',
    enterParentMode: 'Войти в родительский режим',
    signOut: 'Выйти из аккаунта',
    signOutTitle: 'Выйти из аккаунта?',
    signOutMessage:
      'Данные семьи останутся в аккаунте, а с этого устройства удалятся. Приложение начнётся заново, как при первом запуске.',
    signOutOffline: 'Нет связи с сервером. Выйти можно, когда появится сеть.',
    unsentTitle: 'Не все изменения отправлены',
    unsentMessage: 'Часть изменений не дошла до сервера и пропадёт при выходе. Всё равно выйти?',
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
    parentOnly: 'Name, photo, Face ID and signing out are in parent mode.',
    enterParentMode: 'Enter parent mode',
    signOut: 'Sign out',
    signOutTitle: 'Sign out?',
    signOutMessage:
      "Your family's data stays in the account and is removed from this device. The app starts over, as on first launch.",
    signOutOffline: "There's no connection to the server. You can sign out once you're back online.",
    unsentTitle: 'Some changes are not sent',
    unsentMessage: "Some changes haven't reached the server and will be lost when you sign out. Sign out anyway?",
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
    parentOnly: 'El nombre, la foto, Face ID y el cierre de sesión están en el modo padres.',
    enterParentMode: 'Entrar al modo padres',
    signOut: 'Cerrar sesión',
    signOutTitle: '¿Cerrar sesión?',
    signOutMessage:
      'Los datos de la familia se quedan en la cuenta y se borran de este dispositivo. La app empieza de nuevo, como la primera vez.',
    signOutOffline: 'No hay conexión con el servidor. Podrás cerrar sesión cuando vuelva la red.',
    unsentTitle: 'Hay cambios sin enviar',
    unsentMessage: 'Algunos cambios no han llegado al servidor y se perderán al cerrar sesión. ¿Cerrar sesión de todos modos?',
    signOutFailed: 'No se pudo cerrar sesión, inténtalo de nuevo',
    signInFailed: 'No se pudo iniciar sesión. Inténtalo de nuevo.',
    unavailable: 'El servidor no está disponible. El inicio de sesión aparecerá cuando la app se conecte a él.',
  },
});
