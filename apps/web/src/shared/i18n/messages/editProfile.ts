import { defineMessages } from '../lib';

export const editProfile = defineMessages({
  ru: {
    title: 'Профиль',
    name: 'Имя',
    nameHint: 'Видно на всех устройствах семьи',
    saved: 'Имя сохранено',
    saveFailed: 'Не получилось сохранить имя, попробуйте ещё раз',
    uploadPhoto: 'Выбрать фото',
    removePhoto: 'Убрать фото',
    photoNote: 'Фото хранится только на этом устройстве.',
    photoFailed: 'Не получилось сохранить фото',
  },
  en: {
    title: 'Profile',
    name: 'Name',
    nameHint: "Shown on all your family's devices",
    saved: 'Name saved',
    saveFailed: "Couldn't save the name, please try again",
    uploadPhoto: 'Choose photo',
    removePhoto: 'Remove photo',
    photoNote: 'The photo is kept on this device only.',
    photoFailed: "Couldn't save the photo",
  },
  es: {
    title: 'Perfil',
    name: 'Nombre',
    nameHint: 'Se ve en todos los dispositivos de la familia',
    saved: 'Nombre guardado',
    saveFailed: 'No se pudo guardar el nombre, inténtalo de nuevo',
    uploadPhoto: 'Elegir foto',
    removePhoto: 'Quitar foto',
    photoNote: 'La foto se guarda solo en este dispositivo.',
    photoFailed: 'No se pudo guardar la foto',
  },
});
