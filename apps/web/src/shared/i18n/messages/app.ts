import { defineMessages } from '../lib';

export const app = defineMessages({
  ru: {
    parentBadge: 'Родительский контроль',
    storageUnavailable: 'Хранилище недоступно — отметки не сохранятся между сессиями.',
    updated: 'Обновлено до v{version}',
  },
  en: {
    parentBadge: 'Parental control',
    storageUnavailable: 'Storage is unavailable — marks will not be kept between sessions.',
    updated: 'Updated to v{version}',
  },
  es: {
    parentBadge: 'Control parental',
    storageUnavailable: 'El almacenamiento no está disponible: las marcas no se guardarán entre sesiones.',
    updated: 'Actualizado a v{version}',
  },
});
