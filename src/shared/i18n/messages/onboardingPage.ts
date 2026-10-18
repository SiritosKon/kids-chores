import { defineMessages } from '../lib';

export const onboardingPage = defineMessages({
  ru: {
    welcome: 'Добро пожаловать в {app}!',
    intro:
      'Чтобы начать, задайте PIN-код для родительского режима. С ним менять задачи и награды и подтверждать выполненное сможете только вы — дети без вас ничего не изменят.',
    alphaTitle: 'Это альфа-версия',
    alphaText:
      'Приложение работает только локально: все данные хранятся на этом устройстве и никуда не отправляются. Периодически делайте «Экспорт данных» в родительском режиме, чтобы не потерять информацию.',
    choosePin: 'Придумайте PIN родителя',
    repeatPin: 'Повторите PIN',
    pinMismatch: 'PIN не совпал, попробуйте ещё раз',
  },
  en: {
    welcome: 'Welcome to {app}!',
    intro:
      "To get started, set a PIN for parent mode. With it, only you can change chores and rewards and approve what's done — kids can't change anything without you.",
    alphaTitle: 'This is an alpha version',
    alphaText:
      'The app works only locally: all data stays on this device and is never sent anywhere. Use “Export data” in parent mode now and then so you don’t lose anything.',
    choosePin: 'Choose a parent PIN',
    repeatPin: 'Repeat the PIN',
    pinMismatch: 'The PINs don’t match, try again',
  },
  es: {
    welcome: '¡Te damos la bienvenida a {app}!',
    intro:
      'Para empezar, crea un PIN para el modo padres. Así solo tú podrás cambiar tareas y premios y aprobar lo que está hecho: los niños no podrán cambiar nada sin ti.',
    alphaTitle: 'Esta es una versión alfa',
    alphaText:
      'La app funciona solo en local: todos los datos se quedan en este dispositivo y no se envían a ningún sitio. Usa «Exportar datos» en el modo padres de vez en cuando para no perder nada.',
    choosePin: 'Crea un PIN de padres',
    repeatPin: 'Repite el PIN',
    pinMismatch: 'Los PIN no coinciden, inténtalo de nuevo',
  },
});
