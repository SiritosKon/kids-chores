import { defineMessages } from '../lib';

export const joinFamily = defineMessages({
  ru: {
    title: 'Присоединиться к семье',
    intro:
      'Укажите почту или телефон, с которыми входит родитель из этой семьи. Он увидит запрос в настройках и решит, принять ли вас.',
    replaceAlone:
      'Когда вас примут, это устройство получит данные той семьи, а ваша нынешняя семья удалится вместе с данными.',
    replaceShared: 'Когда вас примут, вы выйдете из нынешней семьи, а это устройство получит данные новой.',
    send: 'Отправить запрос',
    sentTitle: 'Запрос отправлен',
    sent: 'Если у человека с этим адресом есть семья в {app}, он увидит запрос. Как только он примет его, данные семьи появятся здесь.',
    tooMany: 'Слишком много запросов за сутки. Попробуйте завтра.',
    done: 'Хорошо',
    invite: '{name} зовёт вас в семью',
    inviteCaption: 'Приглашение действует до {date}',
    someone: 'Кто-то',
    accept: 'Принять',
    decline: 'Отклонить',
    acceptTitle: 'Перейти в другую семью?',
    acceptAlone:
      'Дети, задачи и история на этом устройстве заменятся данными семьи, в которую вас позвали, а ваша нынешняя семья удалится вместе с данными.',
    acceptShared: 'Вы выйдете из нынешней семьи, а это устройство получит данные новой.',
    acceptConfirm: 'Перейти',
    joined: 'Вы в семье. Данные появятся через пару секунд.',
    failed: 'Не получилось. Проверьте интернет и попробуйте ещё раз.',
  },
  en: {
    title: 'Join a family',
    intro:
      'Enter the email or phone a parent of that family signs in with. They will see the request in the settings and decide whether to accept you.',
    replaceAlone:
      "Once you're accepted, this device gets that family's data, and your current family is deleted with its data.",
    replaceShared: "Once you're accepted, you leave your current family, and this device gets the new family's data.",
    send: 'Send the request',
    sentTitle: 'Request sent',
    sent: "If the person with this address has a family in {app}, they will see the request. As soon as they accept it, the family's data shows up here.",
    tooMany: 'Too many requests today. Try again tomorrow.',
    done: 'OK',
    invite: '{name} invites you to the family',
    inviteCaption: 'The invitation is valid until {date}',
    someone: 'Someone',
    accept: 'Accept',
    decline: 'Decline',
    acceptTitle: 'Move to another family?',
    acceptAlone:
      'The kids, chores and history on this device are replaced with the data of the family that invited you, and your current family is deleted with its data.',
    acceptShared: "You leave your current family, and this device gets the new family's data.",
    acceptConfirm: 'Move',
    joined: "You're in the family. The data will show up in a few seconds.",
    failed: "That didn't work. Check the internet and try again.",
  },
  es: {
    title: 'Unirse a una familia',
    intro:
      'Indica el correo o el teléfono con el que entra un padre o una madre de esa familia. Verá la solicitud en los ajustes y decidirá si te acepta.',
    replaceAlone:
      'Cuando te acepten, este dispositivo recibirá los datos de esa familia y tu familia actual se eliminará con sus datos.',
    replaceShared: 'Cuando te acepten, saldrás de tu familia actual y este dispositivo recibirá los datos de la nueva.',
    send: 'Enviar la solicitud',
    sentTitle: 'Solicitud enviada',
    sent: 'Si la persona con esta dirección tiene una familia en {app}, verá la solicitud. En cuanto la acepte, los datos de la familia aparecerán aquí.',
    tooMany: 'Demasiadas solicitudes hoy. Inténtalo mañana.',
    done: 'Vale',
    invite: '{name} te invita a la familia',
    inviteCaption: 'La invitación es válida hasta el {date}',
    someone: 'Alguien',
    accept: 'Aceptar',
    decline: 'Rechazar',
    acceptTitle: '¿Pasar a otra familia?',
    acceptAlone:
      'Los niños, las tareas y el historial de este dispositivo se sustituirán por los datos de la familia que te invitó, y tu familia actual se eliminará con sus datos.',
    acceptShared: 'Saldrás de tu familia actual y este dispositivo recibirá los datos de la nueva.',
    acceptConfirm: 'Pasar',
    joined: 'Ya estás en la familia. Los datos aparecerán en unos segundos.',
    failed: 'No ha funcionado. Revisa internet e inténtalo de nuevo.',
  },
});
