import { defineMessages } from '../lib';

export const onboardingPage = defineMessages({
  ru: {
    welcome: 'Добро пожаловать в {app}!',
    intro:
      'В родительском режиме вы настраиваете детей, задачи и награды и подтверждаете сделанное. PIN-код нужен, чтобы дети не заходили туда сами.',
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
      "In parent mode you set up kids, chores and rewards and approve what's done. The PIN keeps kids from getting in on their own.",
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
      'En el modo padres configuras niños, tareas y premios y apruebas lo que está hecho. El PIN evita que los niños entren por su cuenta.',
    alphaTitle: 'Esta es una versión alfa',
    alphaText:
      'La app funciona solo en local: todos los datos se quedan en este dispositivo y no se envían a ningún sitio. Usa «Exportar datos» en el modo padres de vez en cuando para no perder nada.',
    choosePin: 'Crea un PIN de padres',
    repeatPin: 'Repite el PIN',
    pinMismatch: 'Los PIN no coinciden, inténtalo de nuevo',
  },
});
