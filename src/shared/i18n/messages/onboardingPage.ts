import { defineMessages } from '../lib';

export const onboardingPage = defineMessages({
  ru: {
    welcome: 'Добро пожаловать в {app}!',
    intro:
      'Сзади — пример: ребёнок, задачи и награды. Придумайте PIN для родительского режима, а потом мы покажем, как поменять всё под себя.',
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
      "Behind this window is an example: a kid, chores and rewards. Choose a PIN for parent mode, then we'll show you how to make it your own.",
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
      'Detrás hay un ejemplo: un niño, tareas y premios. Elige un PIN para el modo padres y luego te enseñamos a adaptarlo todo.',
    alphaTitle: 'Esta es una versión alfa',
    alphaText:
      'La app funciona solo en local: todos los datos se quedan en este dispositivo y no se envían a ningún sitio. Usa «Exportar datos» en el modo padres de vez en cuando para no perder nada.',
    choosePin: 'Crea un PIN de padres',
    repeatPin: 'Repite el PIN',
    pinMismatch: 'Los PIN no coinciden, inténtalo de nuevo',
  },
});
