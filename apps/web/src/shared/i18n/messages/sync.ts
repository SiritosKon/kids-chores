import { defineMessages } from '../lib';

export const sync = defineMessages({
  ru: {
    syncing: 'Синхронизация…',
    synced: 'Синхронизировано в {time}',
    offline: 'Нет связи с сервером. Изменения сохранены на устройстве и отправятся позже.',
    failed: 'Сервер не ответил. Попробуем ещё раз через полминуты.',
    signedOut: 'Сессия закончилась. Войдите снова — изменения отправятся после входа.',
    pending: 'Ждут отправки: {count}',
    rejected: 'Сервер не принял изменений: {count}',
    syncNow: 'Синхронизировать',
  },
  en: {
    syncing: 'Syncing…',
    synced: 'Synced at {time}',
    offline: "Can't reach the server. Your changes are saved on this device and will be sent later.",
    failed: "The server didn't respond. We'll try again in half a minute.",
    signedOut: 'Your session has ended. Sign in again and your changes will be sent.',
    pending: 'Waiting to be sent: {count}',
    rejected: 'Changes the server turned down: {count}',
    syncNow: 'Sync now',
  },
  es: {
    syncing: 'Sincronizando…',
    synced: 'Sincronizado a las {time}',
    offline: 'No hay conexión con el servidor. Los cambios están guardados en el dispositivo y se enviarán más tarde.',
    failed: 'El servidor no respondió. Lo intentaremos de nuevo en medio minuto.',
    signedOut: 'La sesión ha terminado. Inicia sesión de nuevo y los cambios se enviarán.',
    pending: 'Pendientes de envío: {count}',
    rejected: 'Cambios que el servidor no aceptó: {count}',
    syncNow: 'Sincronizar',
  },
});
