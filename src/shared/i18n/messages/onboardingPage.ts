import { defineMessages } from '../lib';

export const onboardingPage = defineMessages({
  ru: {
    welcome: 'Добро пожаловать!',
    intro:
      'Дети отмечают дела, копят баллы и обменивают их на награды. Настраивает всё родитель в родительском режиме — он закрыт PIN-кодом из шести цифр.',
    alphaTitle: 'Это альфа-версия',
    alphaText:
      'Приложение работает только локально: все данные хранятся на этом устройстве и никуда не отправляются. Периодически делайте «Экспорт данных» в родительском режиме, чтобы не потерять информацию.',
    choosePin: 'Придумайте PIN родителя',
    repeatPin: 'Повторите PIN',
    pinMismatch: 'PIN не совпал, попробуйте ещё раз',
  },
  en: {
    welcome: 'Welcome!',
    intro:
      'Kids tick off chores, save up points and trade them for rewards. A parent sets everything up in parent mode, which is locked with a six-digit PIN.',
    alphaTitle: 'This is an alpha version',
    alphaText:
      'The app works only locally: all data stays on this device and is never sent anywhere. Use “Export data” in parent mode now and then so you don’t lose anything.',
    choosePin: 'Choose a parent PIN',
    repeatPin: 'Repeat the PIN',
    pinMismatch: 'The PINs don’t match, try again',
  },
  es: {
    welcome: '¡Te damos la bienvenida!',
    intro:
      'Los niños marcan sus tareas, ahorran puntos y los cambian por premios. Un adulto lo configura todo en el modo padres, protegido con un PIN de seis dígitos.',
    alphaTitle: 'Esta es una versión alfa',
    alphaText:
      'La app funciona solo en local: todos los datos se quedan en este dispositivo y no se envían a ningún sitio. Usa «Exportar datos» en el modo padres de vez en cuando para no perder nada.',
    choosePin: 'Crea un PIN de padres',
    repeatPin: 'Repite el PIN',
    pinMismatch: 'Los PIN no coinciden, inténtalo de nuevo',
  },
});
