import { defineMessages } from '../lib';

export const rewardEntity = defineMessages({
  ru: {
    visibility: {
      shop: 'В магазине за баллы',
      streak: 'Только приз за серию',
      hidden: 'Скрыта — сюрприз',
      goal: 'Только цель',
    },
    noPrice: 'без цены',
    newReward: 'Новая награда',
    picker: {
      pick: 'Выбери: {name}',
      sure: 'Точно этот?',
      other: 'Выбрать другой',
      yes: 'Да, этот!',
      want: 'Хочу этот',
    },
  },
  en: {
    visibility: {
      shop: 'In the shop for points',
      streak: 'Streak prize only',
      hidden: 'Hidden — a surprise',
      goal: 'Goal only',
    },
    noPrice: 'no price',
    newReward: 'New reward',
    picker: {
      pick: 'Pick one: {name}',
      sure: 'This one?',
      other: 'Pick another',
      yes: 'Yes, this one!',
      want: 'I want this',
    },
  },
  es: {
    visibility: {
      shop: 'En la tienda por puntos',
      streak: 'Solo premio de racha',
      hidden: 'Oculta: sorpresa',
      goal: 'Solo meta',
    },
    noPrice: 'sin precio',
    newReward: 'Nuevo premio',
    picker: {
      pick: 'Elige: {name}',
      sure: '¿Seguro que este?',
      other: 'Elegir otro',
      yes: '¡Sí, este!',
      want: 'Quiero este',
    },
  },
});
