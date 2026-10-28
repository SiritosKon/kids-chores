import { defineMessages } from '../lib';

export const passkeySetup = defineMessages({
  ru: {
    title: 'Face ID и Touch ID',
    offer: 'Входите в аккаунт без Google — по лицу или отпечатку пальца.',
    unsupported: 'Это устройство не поддерживает вход по Face ID или Touch ID.',
    enable: 'Включить',
    disable: 'Отключить на этом устройстве',
    enabled: 'Вход по Face ID или Touch ID включён',
    disabled: 'Вход по Face ID или Touch ID отключён',
    enableFailed: 'Не получилось включить вход по Face ID или Touch ID',
    disableFailed: 'Не получилось отключить вход по Face ID или Touch ID',
  },
  en: {
    title: 'Face ID and Touch ID',
    offer: 'Sign in without Google — with your face or fingerprint.',
    unsupported: "This device doesn't support Face ID or Touch ID sign-in.",
    enable: 'Turn on',
    disable: 'Turn off on this device',
    enabled: 'Face ID or Touch ID sign-in is on',
    disabled: 'Face ID or Touch ID sign-in is off',
    enableFailed: "Couldn't turn on Face ID or Touch ID sign-in",
    disableFailed: "Couldn't turn off Face ID or Touch ID sign-in",
  },
  es: {
    title: 'Face ID y Touch ID',
    offer: 'Inicia sesión sin Google, con tu cara o tu huella.',
    unsupported: 'Este dispositivo no admite el inicio de sesión con Face ID o Touch ID.',
    enable: 'Activar',
    disable: 'Desactivar en este dispositivo',
    enabled: 'El inicio de sesión con Face ID o Touch ID está activado',
    disabled: 'El inicio de sesión con Face ID o Touch ID está desactivado',
    enableFailed: 'No se pudo activar el inicio de sesión con Face ID o Touch ID',
    disableFailed: 'No se pudo desactivar el inicio de sesión con Face ID o Touch ID',
  },
});
