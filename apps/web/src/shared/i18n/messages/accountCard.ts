import { defineMessages } from '../lib';

export const accountCard = defineMessages({
  ru: {
    title: 'Аккаунт',
    signOut: 'Выйти из аккаунта',
    signOutTitle: 'Выйти из аккаунта?',
    signOutMessage:
      'Данные семьи останутся в аккаунте, а с этого устройства удалятся. Приложение начнётся заново, как при первом запуске.',
    signOutOffline: 'Нет связи с сервером. Выйти можно, когда появится сеть.',
    unsentTitle: 'Не все изменения отправлены',
    unsentMessage: 'Часть изменений не дошла до сервера и пропадёт при выходе. Всё равно выйти?',
    signOutFailed: 'Не получилось выйти, попробуйте ещё раз',
    remove: 'Удалить аккаунт и все данные',
    removeTitle: 'Удалить аккаунт и все данные?',
    removeMessage:
      'С сервера удалятся аккаунт, дети, задачи, награды и вся история, а все устройства семьи выйдут из аккаунта. Отменить это нельзя. Чтобы сохранить копию, сначала сделайте «Экспорт данных» в меню.',
    removeConfirm: 'Удалить всё',
    removeFailed: 'Не получилось удалить аккаунт. Проверьте интернет и попробуйте ещё раз.',
  },
  en: {
    title: 'Account',
    signOut: 'Sign out',
    signOutTitle: 'Sign out?',
    signOutMessage:
      "Your family's data stays in the account and is removed from this device. The app starts over, as on first launch.",
    signOutOffline: "There's no connection to the server. You can sign out once you're back online.",
    unsentTitle: 'Some changes are not sent',
    unsentMessage: "Some changes haven't reached the server and will be lost when you sign out. Sign out anyway?",
    signOutFailed: "Couldn't sign out, please try again",
    remove: 'Delete the account and all data',
    removeTitle: 'Delete the account and all data?',
    removeMessage:
      "The account, kids, chores, rewards and the whole history are deleted from the server, and every family device is signed out. This can't be undone. To keep a copy, use “Export data” in the menu first.",
    removeConfirm: 'Delete everything',
    removeFailed: "Couldn't delete the account. Check the internet and try again.",
  },
  es: {
    title: 'Cuenta',
    signOut: 'Cerrar sesión',
    signOutTitle: '¿Cerrar sesión?',
    signOutMessage:
      'Los datos de la familia se quedan en la cuenta y se borran de este dispositivo. La app empieza de nuevo, como la primera vez.',
    signOutOffline: 'No hay conexión con el servidor. Podrás cerrar sesión cuando vuelva la red.',
    unsentTitle: 'Hay cambios sin enviar',
    unsentMessage: 'Algunos cambios no han llegado al servidor y se perderán al cerrar sesión. ¿Cerrar sesión de todos modos?',
    signOutFailed: 'No se pudo cerrar sesión, inténtalo de nuevo',
    remove: 'Eliminar la cuenta y todos los datos',
    removeTitle: '¿Eliminar la cuenta y todos los datos?',
    removeMessage:
      'Se eliminarán del servidor la cuenta, los niños, las tareas, los premios y todo el historial, y todos los dispositivos de la familia cerrarán sesión. No se puede deshacer. Para guardar una copia, usa antes «Exportar datos» en el menú.',
    removeConfirm: 'Eliminar todo',
    removeFailed: 'No se pudo eliminar la cuenta. Revisa internet e inténtalo de nuevo.',
  },
});
