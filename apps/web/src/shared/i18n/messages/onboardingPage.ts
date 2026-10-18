import { defineMessages } from '../lib';

export const onboardingPage = defineMessages({
  ru: {
    welcome: 'Добро пожаловать в {app}!',
    intro: 'Чтобы начать, задайте PIN-код для родительского режима.',
    abilitiesTitle: 'В родительском режиме вы можете:',
    abilities: {
      edit: 'добавлять и менять детей, задачи и награды',
      approve: 'подтверждать выполненные задачи',
      award: 'выдавать награды за баллы',
      setup: 'настраивать серии и бонусы',
    },
    alphaTitle: 'Это альфа-версия',
    alphaText:
      'Приложение работает только локально: все данные хранятся на этом устройстве и никуда не отправляются. Периодически делайте «Экспорт данных» в родительском режиме, чтобы не потерять информацию.',
    choosePin: 'Придумайте PIN родителя',
    repeatPin: 'Повторите PIN',
    pinMismatch: 'PIN не совпал, попробуйте ещё раз',
  },
  en: {
    welcome: 'Welcome to {app}!',
    intro: 'To get started, set a PIN for parent mode.',
    abilitiesTitle: 'In parent mode you can:',
    abilities: {
      edit: 'add and edit kids, chores and rewards',
      approve: 'approve finished chores',
      award: 'give out rewards for points',
      setup: 'set up streaks and bonuses',
    },
    alphaTitle: 'This is an alpha version',
    alphaText:
      'The app works only locally: all data stays on this device and is never sent anywhere. Use “Export data” in parent mode now and then so you don’t lose anything.',
    choosePin: 'Choose a parent PIN',
    repeatPin: 'Repeat the PIN',
    pinMismatch: 'The PINs don’t match, try again',
  },
  es: {
    welcome: '¡Te damos la bienvenida a {app}!',
    intro: 'Para empezar, crea un PIN para el modo padres.',
    abilitiesTitle: 'En el modo padres puedes:',
    abilities: {
      edit: 'añadir y editar niños, tareas y premios',
      approve: 'aprobar las tareas hechas',
      award: 'dar premios a cambio de puntos',
      setup: 'configurar rachas y bonos',
    },
    alphaTitle: 'Esta es una versión alfa',
    alphaText:
      'La app funciona solo en local: todos los datos se quedan en este dispositivo y no se envían a ningún sitio. Usa «Exportar datos» en el modo padres de vez en cuando para no perder nada.',
    choosePin: 'Crea un PIN de padres',
    repeatPin: 'Repite el PIN',
    pinMismatch: 'Los PIN no coinciden, inténtalo de nuevo',
  },
});
