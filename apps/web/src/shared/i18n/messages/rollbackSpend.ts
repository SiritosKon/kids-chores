import { defineMessages } from '../lib';

export const rollbackSpend = defineMessages({
  ru: {
    undo: 'Вернуть',
    empty: 'Списаний пока нет.',
    confirmTitle: 'Вернуть баллы',
    confirmMessage: 'Отменить списание «{reward}» и вернуть {points} {child}?',
    undone: 'Списание отменено, баллы возвращены',
  },
  en: {
    undo: 'Undo',
    empty: 'No spending yet.',
    confirmTitle: 'Give points back',
    confirmMessage: 'Cancel “{reward}” and give {points} back to {child}?',
    undone: 'Spending canceled, points returned',
  },
  es: {
    undo: 'Devolver',
    empty: 'Todavía no hay gastos.',
    confirmTitle: 'Devolver puntos',
    confirmMessage: '¿Anular «{reward}» y devolver {points} a {child}?',
    undone: 'Gasto anulado, puntos devueltos',
  },
});
