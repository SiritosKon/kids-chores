import { defineMessages } from '../lib';

export const shared = defineMessages({
  ru: {
    pinLabel: 'PIN-код',
    showPin: 'Показать PIN',
    hidePin: 'Скрыть PIN',
    contact: {
      email: 'Почта',
      phone: 'Телефон',
      emailLabel: 'Адрес почты',
      phoneLabel: 'Номер телефона',
      phoneHint: 'С кодом страны: +7 999 123-45-67',
      invalid: 'Проверьте адрес или номер',
    },
    figures: {
      truck: 'Машинка',
      boat: 'Кораблик',
      plane: 'Самолётик',
      helicopter: 'Вертолётик',
      ball: 'Мяч',
    },
  },
  en: {
    pinLabel: 'PIN',
    showPin: 'Show PIN',
    hidePin: 'Hide PIN',
    contact: {
      email: 'Email',
      phone: 'Phone',
      emailLabel: 'Email address',
      phoneLabel: 'Phone number',
      phoneHint: 'With the country code: +44 7700 900123',
      invalid: 'Check the address or number',
    },
    figures: {
      truck: 'Truck',
      boat: 'Boat',
      plane: 'Plane',
      helicopter: 'Helicopter',
      ball: 'Ball',
    },
  },
  es: {
    pinLabel: 'PIN',
    contact: {
      email: 'Correo',
      phone: 'Teléfono',
      emailLabel: 'Dirección de correo',
      phoneLabel: 'Número de teléfono',
      phoneHint: 'Con el prefijo del país: +34 600 123 456',
      invalid: 'Revisa la dirección o el número',
    },
    showPin: 'Mostrar PIN',
    hidePin: 'Ocultar PIN',
    figures: {
      truck: 'Camión',
      boat: 'Barquito',
      plane: 'Avioncito',
      helicopter: 'Helicóptero',
      ball: 'Pelota',
    },
  },
});
