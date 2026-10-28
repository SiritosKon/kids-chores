import { defineMessages } from '../lib';

export const celebrateStreak = defineMessages({
  ru: {
    title: 'Серия!',
    oneChild: '{name} получает награду',
    manyChildren: 'Награды заработаны',
    daysInRow: '{n} день подряд | {n} дня подряд | {n} дней подряд',
    reward: 'Награда',
    hooray: 'Ура!',
  },
  en: {
    title: 'Streak!',
    oneChild: '{name} earned a reward',
    manyChildren: 'Rewards earned',
    daysInRow: '{n} day in a row | {n} days in a row',
    reward: 'Reward',
    hooray: 'Hooray!',
  },
  es: {
    title: '¡Racha!',
    oneChild: '{name} ganó un premio',
    manyChildren: 'Premios ganados',
    daysInRow: '{n} día seguido | {n} días seguidos',
    reward: 'Premio',
    hooray: '¡Bien!',
  },
});
