import { defineMessages } from '../lib';

export const sync = defineMessages({
  ru: {
    offline: 'Нет связи — изменения отправятся позже',
    failed: 'Сервер не ответил — попробуем ещё раз',
    signedOut: 'Сессия закончилась — войдите снова',
    pending: 'Ждут отправки: {count}',
    rejected: 'Не отправилось изменений: {count}',
  },
  en: {
    offline: 'No connection — changes will be sent later',
    failed: "The server didn't respond — we'll try again",
    signedOut: 'Your session has ended — sign in again',
    pending: 'Waiting to be sent: {count}',
    rejected: 'Changes not sent: {count}',
  },
  es: {
    offline: 'Sin conexión: los cambios se enviarán más tarde',
    failed: 'El servidor no respondió: lo intentaremos de nuevo',
    signedOut: 'La sesión ha terminado: inicia sesión de nuevo',
    pending: 'Pendientes de envío: {count}',
    rejected: 'Cambios sin enviar: {count}',
  },
});
