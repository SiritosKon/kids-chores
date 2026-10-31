import { defineMessages } from '../lib';

export const pinQuestion = defineMessages({
  ru: {
    question: 'Секретный вопрос',
    questionHint: 'Такой, ответ на который знают только взрослые',
    answer: 'Ответ',
    answerHint: 'Он понадобится, если забудете PIN. Регистр и лишние пробелы не важны',
  },
  en: {
    question: 'Secret question',
    questionHint: 'One that only grown-ups know the answer to',
    answer: 'Answer',
    answerHint: "You'll need it if you forget the PIN. Case and extra spaces don't matter",
  },
  es: {
    question: 'Pregunta secreta',
    questionHint: 'Una cuya respuesta solo conozcan los adultos',
    answer: 'Respuesta',
    answerHint: 'La necesitarás si olvidas el PIN. Las mayúsculas y los espacios de más no importan',
  },
});
