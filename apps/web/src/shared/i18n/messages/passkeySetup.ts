import { defineMessages } from '../lib';

export const passkeySetup = defineMessages({
  ru: {
    title: 'Вход по Face ID или Touch ID',
    offer: 'Входить в аккаунт на этом устройстве по лицу или отпечатку пальца, без Google.',
    unsupported: 'Это устройство не поддерживает вход по Face ID или Touch ID.',
    enabled: 'Вход по Face ID или Touch ID включён',
    disabled: 'Вход по Face ID или Touch ID отключён',
    enableFailed: 'Не получилось включить вход по Face ID или Touch ID',
    disableFailed: 'Не получилось отключить вход по Face ID или Touch ID',
  },
  en: {
    title: 'Sign in with Face ID or Touch ID',
    offer: 'Sign in on this device with your face or fingerprint, without Google.',
    unsupported: "This device doesn't support Face ID or Touch ID sign-in.",
    enabled: 'Face ID or Touch ID sign-in is on',
    disabled: 'Face ID or Touch ID sign-in is off',
    enableFailed: "Couldn't turn on Face ID or Touch ID sign-in",
    disableFailed: "Couldn't turn off Face ID or Touch ID sign-in",
  },
  es: {
    title: 'Iniciar sesión con Face ID o Touch ID',
    offer: 'Inicia sesión en este dispositivo con tu cara o tu huella, sin Google.',
    unsupported: 'Este dispositivo no admite el inicio de sesión con Face ID o Touch ID.',
    enabled: 'El inicio de sesión con Face ID o Touch ID está activado',
    disabled: 'El inicio de sesión con Face ID o Touch ID está desactivado',
    enableFailed: 'No se pudo activar el inicio de sesión con Face ID o Touch ID',
    disableFailed: 'No se pudo desactivar el inicio de sesión con Face ID o Touch ID',
  },
});
