import { defineMessages } from '../lib';

export const awardReward = defineMessages({
  ru: {
    title: 'Наградить',
    confirm: 'Выдать «{reward}» для {child} за {points}?',
    give: 'Выдать',
    given: '{child}: выдано «{reward}»',
  },
  en: {
    title: 'Give a reward',
    confirm: 'Give “{reward}” to {child} for {points}?',
    give: 'Give',
    given: '{child} got “{reward}”',
  },
  es: {
    title: 'Dar un premio',
    confirm: '¿Dar «{reward}» a {child} por {points}?',
    give: 'Dar',
    given: '{child} recibió «{reward}»',
  },
});
